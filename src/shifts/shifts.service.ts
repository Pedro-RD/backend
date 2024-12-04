import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryParamsShiftDto } from './dto/query-params-shift.dto';
import { Shift } from './entities/shift.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShiftUpdatedEvent } from '../events/shift-updated.event';

@Injectable()
export class ShiftsService {
    logger = new Logger(ShiftsService.name);

    constructor(
        private eventEmitter: EventEmitter2,
        @InjectRepository(Shift) private shiftRepository: Repository<Shift>,
        @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    ) {}

    async create(employeeId: number, createShiftDto: CreateShiftDto) {
        this.logger.log(`Creating shifts for employee ${employeeId}`);
        const employee = await this.employeeRepository.findOne({ where: { id: employeeId }, relations: ['user'] });
        if (!employee) {
            throw new Error('Employee not found');
        }

        // create shifts or update if they already exist

        const shifts = createShiftDto.shifts.map((shiftDto) => {
            const date = this.removeHMS(shiftDto.day);
            return this.shiftRepository.create({ ...shiftDto, day: date });
        });

        await Promise.all(await this.updateOrCreateShifts(employee, shifts));
        this.eventEmitter.emit('shift.updated', new ShiftUpdatedEvent(employee));
    }

    private async updateOrCreateShifts(employee: Employee, shifts: Shift[]) {
        return shifts.map(async (shift) => {
            const existingShift = await this.shiftRepository.findOne({ where: { day: shift.day }, relations: ['employee'] });
            this.logger.log(`Existing shift ${existingShift}`);

            if (existingShift) {
                this.logger.log(`Updating shift for employee ${employee.id} on day ${shift.day}`);
                existingShift.shift = shift.shift;
                await this.shiftRepository.save(existingShift);
            } else {
                this.logger.log(`Creating shift for employee ${employee.id} on day ${shift.day}`);
                const newShift = this.shiftRepository.create({ ...shift, employee });
                await this.shiftRepository.save(newShift);
            }
        });
    }

    async findAll(employeeId: number, query: QueryParamsShiftDto) {
        const [from, to] = this.getDates(query);
        const queryBuilder = this.shiftRepository.createQueryBuilder('shift').where('shift.employeeId = :employeeId', { employeeId });
        queryBuilder.andWhere('shift.day BETWEEN :from AND :to', { from, to });

        const result = await queryBuilder.orderBy('shift.day', 'ASC').getMany();

        return result.map((shift) => plainToClass(Shift, shift));
    }

    private getDates({ from, to }: QueryParamsShiftDto): Date[] {
        if (!from && !to) {
            return this.getDefaultDates();
        }

        if (from && !to) {
            return [this.removeHMS(from), this.removeHMS(from)];
        }

        if (!from && to) {
            return [this.removeHMS(to), this.removeHMS(to)];
        }

        return [this.removeHMS(from), this.removeHMS(to)];
    }

    public removeHMS(date: Date): Date {
        if (!date) {
            this.logger.error(`Invalid date ${date}`);
            throw new Error('Invalid date');
        }
        date = new Date(date);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    public getDefaultDates(): Date[] {
        // get the first day and last of the current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return [firstDay, lastDay];
    }
}
