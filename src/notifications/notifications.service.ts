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
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(NotificationEvent) private readonly notificationRepository: Repository<NotificationEvent>,
    ) {}
    // create(createNotificationDto: CreateNotificationDto) {
    //     return 'This action adds a new notification';
    // }

    // findAll() {
    //     return `This action returns all notifications`;
    // }

    // findOne(id: number) {
    //     return `This action returns a #${id} notification`;
    // }

    // update(id: number, updateNotificationDto: UpdateNotificationDto) {
    //     return `This action updates a #${id} notification`;
    // }

    // remove(id: number) {
    //     return `This action removes a #${id} notification`;
    // }

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

        await this.notificationRepository.save(notification);
        this.logger.log(`Notification created for employee ${payload.employee.id}`);
    }

    @OnEvent('appointment.due', { async: true })
    async handleAppointmentDueEvent(payload: Appointment) {
        this.logger.log(`Appointment due event received for appointment ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Evento marcado para as ${payload.start} com ${payload.resident.name}`,
            type: NotificationType.APPOINTMENT,
            status: NotificationStatus.PENDING,
            resident: payload.resident,
        });

        await this.notificationRepository.save(notification);
        this.logger.log(`Notification created for appointment ${payload.id}`);
    }

    @OnEvent('medicament.administration.due', { async: true })
    async handleMedicamentAdministrationDueEvent(payload: MedicamentAdministrationEvent) {
        this.logger.log(`Medicament administration due event received for medicament ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Administração de medicamento de ${payload.administration.medicament.name} para ${payload.administration.medicament.resident.name}`,
            type: NotificationType.MEDICAMENT,
            status: NotificationStatus.PENDING,
            resident: payload.administration.medicament.resident,
            medicament: payload.administration.medicament,
        });

        await this.notificationRepository.save(notification);
        this.logger.log(`Notification created for medicament administration ${payload.administration.medicament.id}`);
    }

    @OnEvent('message.created', { async: true })
    async handleMessageCreatedEvent(payload: MessagesEvent) {
        this.logger.log(`Message created event received for message ${JSON.stringify(payload)}`);
        const notification = this.notificationRepository.create({
            message: `Nova mensagem sobre o residente ${payload.resident.name}`,
            type: NotificationType.MESSAGE,
            status: NotificationStatus.PENDING,
            resident: payload.resident,
        });

        await this.notificationRepository.save(notification);
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

        await this.notificationRepository.save(notification);
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

        await this.notificationRepository.save(notification);
        this.logger.log(`Notification created for medicament running low ${payload.id}`);
    }
}
