import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Between, Not, Repository } from 'typeorm';
import PagedResponse from '../interfaces/paged-response.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryParamsAppointmentDto } from './dto/query-params-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
    logger = new Logger(AppointmentsService.name);

    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
    ) {}

    private async checkTimeConflict(residentId: number, start: Date | string, id?: number) {
        this.logger.log(`Checking for time conflict for resident ${residentId} at ${start}`);
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
            this.logger.error(`An appointment already exists within one hour of ${startDate.toISOString()}`);
            throw new BadRequestException(`An appointment already exists within one hour of ${startDate.toISOString()}`);
        }
    }

    async create(residentId: number, createAppointmentDto: CreateAppointmentDto) {
        this.logger.log('Creating appointment', JSON.stringify(createAppointmentDto));
        await this.checkTimeConflict(residentId, createAppointmentDto.start);

        const appointment = this.appointmentsRepository.create({
            ...createAppointmentDto,
            residentId,
        });
        const appoint = await this.appointmentsRepository.save(appointment);
        this.logger.log('Appointment created', JSON.stringify(appoint));
        return plainToClass(Appointment, appoint);
    }

    async findAll(residentId: number, { page, limit, orderBy, order, status, type, search }: QueryParamsAppointmentDto): Promise<PagedResponse<Appointment>> {
        try {
            this.logger.log('Fetching appointments', JSON.stringify({ residentId, page, limit, orderBy, order, status, type, search }));
            search = search?.toLowerCase();
            // Create query builder
            const queryBuilder = this.appointmentsRepository.createQueryBuilder('appointment');
            let queryString = `appointment.residentId = :residentId`;

            if (status) {
                queryString += ` AND appointment.status = :status`;
            }

            if (type) {
                queryString += ` AND appointment.type = :type`;
            }

            if (search) {
                queryString += ` AND (LOWER(appointment.title) LIKE :search OR LOWER(appointment.observation) LIKE :search)`;
            }

            queryBuilder.where(queryString, { residentId, status, type, search: `%${search}%` });

            // Apply pagination

            const [appointments, total] = await queryBuilder
                .orderBy(`appointment.${orderBy}`, order)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            this.logger.log('Appointments fetched', JSON.stringify(appointments), total);

            return {
                data: appointments.map((appointment) => plainToClass(Appointment, appointment)),
                page,
                limit,
                totalCount: total,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.error(error.message, error.stack);
            throw new BadRequestException('Error while fetching appointments');
        }
    }

    async findOne(id: number, residentId: number) {
        this.logger.log('Finding appointment', id);
        const appointment = await this.appointmentsRepository.findOne({
            where: { id, residentId },
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment #${id} not found`);
        }

        this.logger.log('Appointment found', JSON.stringify(appointment));
        return plainToClass(Appointment, appointment);
    }

    async update(id: number, residentId: number, updateAppointmentDto: UpdateAppointmentDto) {
        this.logger.log('Updating appointment', id, JSON.stringify(updateAppointmentDto));
        if (updateAppointmentDto.start) {
            this.logger.log('Checking for time conflict');
            await this.checkTimeConflict(residentId, updateAppointmentDto.start, id);
        }

        const appointment = await this.findOne(id, residentId);
        Object.assign(appointment, updateAppointmentDto);
        const appoint = await this.appointmentsRepository.save(appointment);
        this.logger.log('Appointment updated', JSON.stringify(appoint));
        return plainToClass(Appointment, appoint);
    }

    async remove(id: number, residentId: number) {
        this.logger.log('Removing appointment', id);
        const appointment = await this.findOne(id, residentId);

        this.logger.log('Soft removing appointment', id);
        return await this.appointmentsRepository.softRemove(appointment);
    }
}