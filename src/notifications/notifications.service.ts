import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ShiftUpdatedEvent } from '../events/shift-updated.event';
import { MedicamentAdministrationEvent } from '../medicament-administration/medicament-administration.service';
import { MessagesEvent } from '../events/message.event';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEvent, NotificationStatus, NotificationType } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { BehaviorSubject } from 'rxjs';
import { Cron } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';

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
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
        // Created in the last day
        queryBuilder.andWhere('notification.createdAt >= :date', { date: new Date(Date.now() - 86400000) });
        queryBuilder.andWhere('notification.type IN (:...types)', { types: generalTypes });

        queryBuilder.leftJoinAndSelect('notification.appointment', 'appointment');
        queryBuilder.leftJoinAndSelect('notification.medicament', 'medicament');
        queryBuilder.leftJoinAndSelect('notification.userMessage', 'message');
        queryBuilder.orderBy('notification.createdAt', 'DESC');

        const notifications = await queryBuilder.getMany();
        this._internalNotifications.next(notifications);
    }

    async resetShifts(userReq: User) {
        const shift = await this.getShifts(userReq);
        if (shift) {
            shift.status = NotificationStatus.CANCELED;
            await this.notificationRepository.save(shift);
        }
    }

    async resetMessages(userReq: User) {
        const messages = await this.getMessages(userReq);
        messages.forEach(async (message) => {
            message.status = NotificationStatus.DONE;
            await this.notificationRepository.save(message);
        });
    }

    async updateStatus(notificationId: number, status: NotificationStatus) {
        this.logger.log(`Updating notification ${notificationId} status to ${status}`);
        const notification = await this.notificationRepository.findOne({ where: { id: notificationId }, relations: ['medicament'] });
        if (!notification) {
            return;
        }

        notification.status = status;
        const result = await this.notificationRepository.save(notification);

        if (result.status === NotificationStatus.DONE) {
            this._internalNotifications.next(this.internalNotifications.filter((n) => n.id !== notificationId));
        }

        if (notification.type === NotificationType.MEDICAMENT) {
            this.eventEmitter.emit('medicament.administration.done', { administration: notification.medicament });
        }

        this.logger.log(`Notification ${notificationId} status updated to ${status}`);
    }

    async getShifts(user) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.leftJoinAndSelect('notification.user', 'user');
        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
        queryBuilder.andWhere('notification.type = :type', { type: NotificationType.SHIFT });
        queryBuilder.andWhere('notification.user = :user', { user });
        queryBuilder.orderBy('notification.createdAt', 'DESC');

        const result = await queryBuilder.getMany();

        const [first, ...rest] = result;
        rest.forEach(async (notification) => {
            notification.status = NotificationStatus.CANCELED;
            await this.notificationRepository.save(notification);
        });

        return first;
    }

    async getMessages(user: User) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        queryBuilder.leftJoinAndSelect('notification.userMessage', 'message');
        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
        queryBuilder.andWhere('notification.type = :type', { type: NotificationType.MESSAGE_RELATIVE });
        queryBuilder.andWhere('message.user = :user', { user });
        queryBuilder.orderBy('notification.createdAt', 'DESC');

        return await queryBuilder.getMany();
    }

    // Handle events
    @OnEvent('shift.updated', { async: true })
    async handleShiftUpdatedEvent(payload: ShiftUpdatedEvent) {
        this.logger.log(`Shift updated event received for employee ${JSON.stringify(payload)}`);

        // Create a notification
        const notification = this.notificationRepository.create({
            message: `Turno atualizado para o empregado ${payload.employee}`,
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
        const notification = this.notificationRepository.create({
            message: `Evento marcado para as ${payload.start} com ${payload.resident.name}`,
            type: NotificationType.APPOINTMENT,
            status: NotificationStatus.PENDING,
            appointment: payload,
        });

        const result = await this.notificationRepository.save(notification);

        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for appointment ${payload.id}`);
    }

    @OnEvent('medicament.administration.due', { async: true })
    async handleMedicamentAdministrationDueEvent(payload: MedicamentAdministrationEvent) {
        this.logger.log(`Medicament administration due event received for medicament ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Administração de medicamento de ${payload.administration.medicament.name} para ${payload.administration.medicament.resident.name}`,
            type: NotificationType.MEDICAMENT,
            status: NotificationStatus.PENDING,
            medicament: payload.administration.medicament,
        });

        const result = await this.notificationRepository.save(notification);
        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for medicament administration ${payload.administration.medicament.id}`);
    }

    @OnEvent('message.created', { async: true })
    async handleMessageCreatedEvent(payload: MessagesEvent) {
        this.logger.log(`Message created event received for message ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Nova mensagem sobre o residente ${payload.resident.name}`,
            type: NotificationType.MESSAGE,
            status: NotificationStatus.PENDING,
            userMessage: payload,
        });

        payload.resident.relatives.forEach(async (relative) => {
            const notification = this.notificationRepository.create({
                message: `Nova mensagem sobre o residente ${payload.resident.name}`,
                type: NotificationType.MESSAGE_RELATIVE,
                status: NotificationStatus.PENDING,
                userMessage: payload,
                user: relative,
            });

            await this.notificationRepository.save(notification);
        });

        const result = await this.notificationRepository.save(notification);
        this._internalNotifications.next([...this.internalNotifications, result]);
        this.logger.log(`Notification created for message of resident ${payload.resident.id}`);
    }

    @OnEvent('medicament.out-of-stock', { async: true })
    async handleMedicamentOutOfStockEvent(payload: Medicament) {
        this.logger.log(`Medicament out of stock event received for medicament ${JSON.stringify(payload)}`);
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
        queryBuilder.where('notification.status = :status', { status: NotificationStatus.PENDING });
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
