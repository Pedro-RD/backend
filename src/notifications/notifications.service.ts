import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ShiftUpdatedEvent } from '../events/shift-updated.event';
import { MedicamentAdministrationEvent } from '../medicament-administration/medicament-administration.service';
import { MessagesEvent } from '../events/message.event';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification.entity';
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

    @OnEvent('shift.updated')
    handleShiftUpdatedEvent(payload: ShiftUpdatedEvent) {
        console.log('Shift updated event received', payload);
    }

    @OnEvent('appointment.due')
    handleAppointmentDueEvent(payload: Appointment) {
        console.log('Appointment due event received', payload);
    }

    @OnEvent('medicament.administration.due')
    handleMedicamentAdministrationDueEvent(payload: MedicamentAdministrationEvent) {
        console.log('Medicament administration due event received', payload);
    }

    @OnEvent('message.created')
    handleMessageCreatedEvent(payload: MessagesEvent) {
        console.log('Message created event received', payload);
    }

    @OnEvent('medicament.out-of-stock')
    handleMedicamentOutOfStockEvent(payload: Medicament) {
        console.log('Medicament out of stock event received', payload);
    }

    @OnEvent('medicament.running-low')
    handleMedicamentRunningLowEvent(payload: Medicament) {
        console.log('Medicament running low event received', payload);
    }
}
