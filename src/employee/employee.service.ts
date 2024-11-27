import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import PagedResponse from '../interfaces/paged-response.interface';
import { User } from '../users/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryParamsEmployeeDto } from './dto/query-params-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
    private readonly logger = new Logger(EmployeeService.name);
    constructor(
        @InjectRepository(Employee)
        private readonly employeesRepository: Repository<Employee>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(createEmployeeDto: CreateEmployeeDto) {
        const user = await this.getUserOrFail(createEmployeeDto.userId);

        try {
            const employee = await this.employeesRepository.create({
                ...createEmployeeDto,
                user,
            });

            await this.employeesRepository.save(employee);
            return plainToClass(Employee, employee);
        } catch (e) {
            throw new BadRequestException('An error occurred while adding the employee');
        }
    }

    async findAll({ order, orderBy, search, limit, page }: QueryParamsEmployeeDto): Promise<PagedResponse<Employee>> {
        //filters are missing
        const queryBuilder = this.employeesRepository.createQueryBuilder('employee');
        queryBuilder.leftJoinAndSelect('employee.user', 'user');

        if (search) {
            queryBuilder.andWhere('user.name ILIKE :search', { search: `%${search}%` });
        }

        const [employees, totalCount] = await queryBuilder
            .orderBy(`employee.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: employees.map((employee) => plainToClass(Employee, employee)),
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(id: number) {
        const employee = await this.getEmployeeOrFail(id);
        return plainToClass(Employee, employee);
    }

    async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
        const user = await this.getUserOrFail(updateEmployeeDto.userId);

        try {
            const employee = await this.employeesRepository.preload({
                id: +id,
                ...updateEmployeeDto,
                user,
            });

            await this.employeesRepository.save(employee);
            return plainToClass(Employee, employee);
        } catch (e) {
            throw new BadRequestException('An error occurred while updating the employee');
        }
    }

    async remove(id: number) {
        await this.getEmployeeOrFail(id);
        await this.employeesRepository.softDelete(id);
    }

    private async getEmployeeOrFail(id: number): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        return employee;
    }

    private async getUserOrFail(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
