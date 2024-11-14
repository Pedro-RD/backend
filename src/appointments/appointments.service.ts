import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  private async checkTimeConflict(residentId: number, start: Date | string, id?: number) {
    const startDate = new Date(start);
    const oneHourBefore = new Date(startDate);
    const oneHourAfter = new Date(startDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    oneHourAfter.setHours(oneHourAfter.getHours() + 1);

    const query = {
      where: {
        residentId,
        start: Between(oneHourBefore, oneHourAfter),
      },
    };

    if (id) {
      Object.assign(query.where, { id: Not(id) });
    }

    const conflictingAppointment = await this.appointmentsRepository.findOne(query);

    if (conflictingAppointment) {
      throw new BadRequestException(
        `An appointment already exists within one hour of ${startDate.toISOString()}`,
      );
    }
  }

  async create(residentId: number, createAppointmentDto: CreateAppointmentDto) {
    await this.checkTimeConflict(residentId, createAppointmentDto.start);
    
    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      residentId,
    });
    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(residentId: number) {
    return await this.appointmentsRepository.find({
      where: { residentId },
      order: { start: 'DESC' },
    });
  }

  async findOne(id: number, residentId: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id, residentId },
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment #${id} not found`);
    }
    
    return appointment;
  }

  async update(id: number, residentId: number, updateAppointmentDto: UpdateAppointmentDto) {
    if (updateAppointmentDto.start) {
      await this.checkTimeConflict(residentId, updateAppointmentDto.start, id);
    }
    
    const appointment = await this.findOne(id, residentId);
    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: number, residentId: number) {
    const appointment = await this.findOne(id, residentId);
    return await this.appointmentsRepository.softRemove(appointment);
  }
}
