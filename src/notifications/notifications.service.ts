import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ShiftUpdatedEvent } from '../events/shift-updated.event';
import { MedicamentAdministrationEvent } from '../medicament-administration/medicament-administration.service';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEvent, NotificationStatus, NotificationType } from './entities/notification.entity';
import { In, Repository } from 'typeorm';
import { BehaviorSubject } from 'rxjs';
import { Cron } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';
import { Role } from '../enums/roles.enum';
import { Message } from '../messages/entities/message.entity';
import { MedicamentAdministration } from '../medicament-administration/entities/medicament-administration.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private readonly _internalNotifications = new BehaviorSubject<NotificationEvent[]>([]);
    public readonly internalNotifications$ = this._internalNotifications.asObservable();

    public get internalNotifications() {
        return this._internalNotifications.value;
    }

    constructor(
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(NotificationEvent) private readonly notificationRepository: Repository<NotificationEvent>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MedicamentAdministration) private readonly medicamentAdministrationRepository: Repository<MedicamentAdministration>,
        @InjectRepository(Medicament) private readonly medicamentRepository: Repository<Medicament>,
    ) {}

    // Load notifications
    async loadNotifications() {
        const generalTypes = [
            NotificationType.APPOINTMENT,
            NotificationType.MEDICAMENT,
            NotificationType.MEDICAMENT_LOW,
            NotificationType.MEDICAMENT_STOCK,
            NotificationType.MESSAGE,
        ];

        const status = [NotificationStatus.PENDING, NotificationStatus.ONGOING];

        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.where('notification.status IN (:...status)', { status });

        // Created in the last day
        queryBuilder.andWhere('notification.createdAt >= :date', { date: new Date(Date.now() - 86400000) });
        queryBuilder.andWhere('notification.type IN (:...types)', { types: generalTypes });

        queryBuilder.leftJoinAndSelect('notification.appointment', 'appointment');
        queryBuilder.leftJoinAndSelect('notification.medicament', 'medicament');
        queryBuilder.leftJoinAndSelect('notification.userMessage', 'message');
        queryBuilder.leftJoinAndSelect('notification.user', 'user');
        queryBuilder.leftJoinAndSelect('message.resident', 'resident');
        queryBuilder.leftJoinAndSelect('medicament.resident', 'medicamentResident');
        queryBuilder.leftJoinAndSelect('appointment.resident', 'appointmentResident');

        queryBuilder.orderBy('notification.createdAt', 'ASC');

        const notifications = await queryBuilder.getMany();
        this.logger.log(`Notifications loaded: ${JSON.stringify(notifications)}`);
        this._internalNotifications.next(notifications);
    }

    async resetShifts(userReq: User) {
        const shift = await this.getShifts(userReq);
        shift.forEach(async (notification) => {
            notification.status = NotificationStatus.DONE;
            await this.notificationRepository.save(notification);
        });
    }

    async resetMessages(userReq: User) {
        const messages = await this.getMessages(userReq);
        messages.forEach(async (message) => {
            message.status = NotificationStatus.DONE;
            await this.notificationRepository.save(message);
        });
    }

    async updateStatus(notificationId: number, status: NotificationStatus, userid: number) {
        this.logger.log(`Updating notification ${notificationId} status to ${status}`);
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId },
            relations: [
                'medicament',
                'appointment',
                'userMessage',
                'user',
                'medicamentAdministration',
                'userMessage.resident',
                'medicament.resident',
                'appointment.resident',
                'userMessage.resident',
                'userMessage.resident',
                'medicamentAdministration.medicament',
                'medicamentAdministration.medicament.resident',
            ],
        });
        if (!notification) {
            return;
        }
        this.logger.log(`Notification found: ${JSON.stringify(notification)}`);

        notification.status = status;
        if (status === NotificationStatus.ONGOING) {
            notification.user = await this.userRepository.findOne({ where: { id: userid } });
        } else if (status === NotificationStatus.PENDING) {
            notification.user = null;
        }

        const result = await this.notificationRepository.save(notification);

        if (result.status === NotificationStatus.ONGOING || result.status === NotificationStatus.PENDING) {
            this._internalNotifications.next(this._internalNotifications.value.map((n) => (n.id === notificationId ? result : n)));
        }

        if (result.status === NotificationStatus.DONE || result.status === NotificationStatus.CANCELED) {
            this._internalNotifications.next(this.internalNotifications.filter((n) => n.id !== notificationId));
        }

        if (notification.type === NotificationType.MEDICAMENT) {
            this.logger.warn('Medicament notification status updated, checking stock');
            if (status === NotificationStatus.DONE) {
                const medicament = notification.medicamentAdministration.medicament;
                if (medicament.quantity > 0) {
                    this.logger.warn('Medicament above 0, updating stock');
                    medicament.quantity -= notification.medicamentAdministration.dose;
                    await this.medicamentRepository.save(medicament);
                }

                if (medicament.quantity <= 0) {
                    this.logger.error('Medicament out of stock');
                    this.eventEmitter.emit('medicament.out-of-stock', medicament);
                } else if (medicament.quantity <= 5) {
                    this.logger.error('Medicament running low');
                    this.eventEmitter.emit('medicament.running-low', medicament);
                }
            }
        }

        this.logger.log(`Notification ${notificationId} status updated to ${status}`);
    }

    async getShifts(user: User) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.leftJoinAndSelect('notification.user', 'user');
        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
        queryBuilder.andWhere('notification.type = :type', { type: NotificationType.SHIFT });
        Logger.log(user);
        queryBuilder.orderBy('notification.createdAt', 'DESC');

        const result = await queryBuilder.getMany();

        const [first, ...rest] = result;
        rest.forEach(async (notification) => {
            notification.status = NotificationStatus.CANCELED;
            await this.notificationRepository.save(notification);
        });

        return first ? [first] : [];
    }

    async getMessages(user: User) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
        queryBuilder.andWhere('notification.type = :type', { type: NotificationType.MESSAGE_RELATIVE });
        queryBuilder.andWhere('notification.user.id = :userId', { userId: user.id });
        queryBuilder.orderBy('notification.createdAt', 'DESC');

        return await queryBuilder.getMany();
    }

    // Handle events
    @OnEvent('shift.updated', { async: true })
    async handleShiftUpdatedEvent(payload: ShiftUpdatedEvent) {
        this.logger.log(`Shift updated event received for employee ${JSON.stringify(payload)}`);

        // Create a notification
        const notification = this.notificationRepository.create({
            message: `Turno atualizado`,
            type: NotificationType.SHIFT,
            status: NotificationStatus.PENDING,
            user: payload.employee.user,
        });

        const result = await this.notificationRepository.save(notification);

        this.logger.log(`Notification created for employee ${(payload.employee.id, JSON.stringify(result))}`);
    }

    @OnEvent('appointment.due', { async: true })
    async handleAppointmentDueEvent(payload: Appointment) {
        this.logger.log(`Appointment due event received for appointment ${JSON.stringify(payload)}`);

        const notificationExists = await this.notificationRepository.findOne({
            where: {
                appointment: {
                    id: payload.id,
                },
                type: NotificationType.APPOINTMENT,
                status: In([NotificationStatus.PENDING, NotificationStatus.ONGOING]),
            },
            relations: ['appointment'],
        });

        if (notificationExists) {
            return;
        }

        const notification = this.notificationRepository.create({
            message: `Evento marcado para ${payload.resident.name}`,
            type: NotificationType.APPOINTMENT,
            status: NotificationStatus.PENDING,
            appointment: payload,
            date: payload.start,
        });

        const result = await this.notificationRepository.save(notification);

        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for appointment ${payload.id}`);
    }

    @OnEvent('medicament.administration.due', { async: true })
    async handleMedicamentAdministrationDueEvent(payload: MedicamentAdministrationEvent) {
        const now = new Date();
        this.logger.log(`Medicament administration due event received for medicament ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Medicação ${payload.administration.medicament.name}`,
            type: NotificationType.MEDICAMENT,
            status: NotificationStatus.PENDING,
            medicamentAdministration: payload.administration,
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), payload.administration.hour, payload.administration.minute),
        });

        const result = await this.notificationRepository.save(notification);
        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for medicament administration ${payload.administration.medicament.id}`);
    }

    @OnEvent('message.created', { async: true })
    async handleMessageCreatedEvent(payload: Message) {
        this.logger.log(`Message created event received for message ${JSON.stringify(payload)}`);
        if (payload.user.role === Role.Relative) {
            const notificationExists = await this.notificationRepository.find({
                where: {
                    userMessage: {
                        resident: {
                            id: payload.resident.id,
                        },
                    },
                    type: NotificationType.MESSAGE,
                    status: In([NotificationStatus.PENDING, NotificationStatus.ONGOING]),
                    user: null,
                },
            });

            Logger.log(`Notification exists: ${JSON.stringify(notificationExists)}`);

            if (notificationExists.length) {
                const ids = await Promise.all(
                    notificationExists.map(async (ne) => {
                        ne.status = NotificationStatus.CANCELED;
                        await this.notificationRepository.save(ne);
                        return ne.id;
                    }),
                );

                this._internalNotifications.next(this.internalNotifications.filter((n) => !ids.includes(n.id)));
            }

            const notification = this.notificationRepository.create({
                message: `Nova mensagem sobre o residente ${payload.resident.name}`,
                type: NotificationType.MESSAGE,
                status: NotificationStatus.PENDING,
                userMessage: payload,
            });
            const result = await this.notificationRepository.save(notification);
            this._internalNotifications.next([...this.internalNotifications, result]);
        }

        payload.resident.relatives.forEach(async (relative) => {
            if (relative.id === payload.user.id) {
                return;
            }

            const notificationExists = await this.notificationRepository.find({
                where: {
                    userMessage: {
                        resident: {
                            id: payload.resident.id,
                        },
                    },
                    type: NotificationType.MESSAGE_RELATIVE,
                    status: In([NotificationStatus.PENDING, NotificationStatus.ONGOING]),
                    user: relative,
                },
                relations: ['user', 'userMessage', 'userMessage.resident'],
            });

            if (notificationExists.length) {
                await Promise.all(
                    notificationExists.map(async (ne) => {
                        ne.status = NotificationStatus.CANCELED;
                        await this.notificationRepository.save(ne);
                    }),
                );
            }

            const notification = this.notificationRepository.create({
                message: `Nova mensagem sobre o residente ${payload.resident.name}`,
                type: NotificationType.MESSAGE_RELATIVE,
                status: NotificationStatus.PENDING,
                userMessage: payload,
                user: relative,
            });

            await this.notificationRepository.save(notification);
        });

        this.logger.log(`Notification created for message of resident ${payload.resident.id}`);
    }

    @OnEvent('medicament.out-of-stock', { async: true })
    async handleMedicamentOutOfStockEvent(payload: Medicament) {
        this.logger.log(`Medicament out of stock event received for medicament ${JSON.stringify(payload)}`);

        const notificationExists = await this.notificationRepository.find({
            where: {
                medicament: {
                    id: payload.id,
                },
                type: NotificationType.MEDICAMENT_STOCK,
                status: In([NotificationStatus.PENDING, NotificationStatus.ONGOING]),
            },
            relations: ['medicament'],
        });

        if (notificationExists.length > 0) {
            this.logger.warn(`Found more than one notification for medicament out of stock ${payload.id}`);
            const ids = await Promise.all(
                notificationExists.map(async (notification) => {
                    notification.status = NotificationStatus.CANCELED;
                    await this.notificationRepository.save(notification);
                    return notification.id;
                }),
            );
            this._internalNotifications.next(this.internalNotifications.filter((n) => !ids.includes(n.id)));
        }

        const notification = this.notificationRepository.create({
            message: `Medicamento ${payload.name} está fora de stock`,
            type: NotificationType.MEDICAMENT_STOCK,
            status: NotificationStatus.PENDING,
            medicament: payload,
        });

        const result = await this.notificationRepository.save(notification);
        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for medicament out of stock ${payload.id}`);
    }

    @OnEvent('medicament.running-low', { async: true })
    async handleMedicamentRunningLowEvent(payload: Medicament) {
        this.logger.log(`Medicament running low event received for medicament ${JSON.stringify(payload)}`);

        const notificationExists = await this.notificationRepository.find({
            where: {
                medicament: {
                    id: payload.id,
                },
                type: NotificationType.MEDICAMENT_LOW,
                status: In([NotificationStatus.PENDING, NotificationStatus.ONGOING]),
            },
            relations: ['medicament'],
        });

        if (notificationExists.length > 0) {
            this.logger.warn(`Found more than one notification for medicament running low ${payload.id}`);
            const ids = await Promise.all(
                notificationExists.map(async (notification) => {
                    notification.status = NotificationStatus.CANCELED;
                    await this.notificationRepository.save(notification);
                    return notification.id;
                }),
            );
            this._internalNotifications.next(this.internalNotifications.filter((n) => !ids.includes(n.id)));
        }

        const notification = this.notificationRepository.create({
            message: `Medicamento ${payload.name} está com baixo stock`,
            type: NotificationType.MEDICAMENT_LOW,
            status: NotificationStatus.PENDING,
            medicament: payload,
        });

        const result = await this.notificationRepository.save(notification);
        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for medicament running low ${payload.id}`);
    }

    @Cron('0 0 * * *')
    async handleNotificationsCron() {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.where('notification.status = :status', {
            status: NotificationStatus.PENDING,
            type: In([NotificationType.APPOINTMENT, NotificationType.MEDICAMENT]),
        });
        queryBuilder.andWhere('notification.createdAt < :date', { date: new Date(Date.now() - 86400000) });

        const notifications = await queryBuilder.getMany();
        notifications.forEach(async (notification) => {
            notification.status = NotificationStatus.CANCELED;
            await this.notificationRepository.save(notification);
        });

        this.loadNotifications();
        this.logger.log('Notifications checked');
    }
}
