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
    ) {}

    async create(createEmployeeDto: CreateEmployeeDto) {
        this.logger.log(`Creating employee with data: ${JSON.stringify(createEmployeeDto)}`);
        const user = await this.getUserOrFail(createEmployeeDto.userId);

        try {
            const employee = await this.employeesRepository.create({
                ...createEmployeeDto,
                user,
            });

            await this.employeesRepository.save(employee);
            return plainToClass(Employee, employee);
        } catch (e) {
            this.logger.error(`An error occurred while creating the employee: ${e.message}`);
            throw new BadRequestException('Ocorreu um erro ao criar o funcionário');
        }
    }

    async findAll({ order, orderBy, search, limit, page }: QueryParamsEmployeeDto): Promise<PagedResponse<Employee>> {
        //filters are missing
        this.logger.log(`Fetching employees with order: ${order}, orderBy: ${orderBy}, search: ${search}, limit: ${limit}, page: ${page}`);
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
        this.logger.log(`Fetching employee with id: ${id}`);
        const employee = await this.getEmployeeOrFail(id);
        return plainToClass(Employee, employee);
    }

    async update(id: number, { salary, contractEnds, contractStart }: UpdateEmployeeDto) {
        this.logger.log(`Updating employee with id: ${id} with data: ${JSON.stringify({ salary, contractEnds, contractStart })}`);

        try {
            await this.getEmployeeOrFail(id);

            const result = await this.employeesRepository.save({ id, salary, contractEnds, contractStart });
            this.logger.log(`Employee updated successfully: ${JSON.stringify(result)}`);
            return plainToClass(Employee, result);
        } catch (e) {
            this.logger.error(`An error occurred while updating the employee: ${e.message}`);
            throw new BadRequestException('Ocorreu um erro ao atualizar o funcionário');
        }
    }

    async remove(id: number) {
        this.logger.log(`Deleting employee with id: ${id}`);
        await this.getEmployeeOrFail(id);
        await this.employeesRepository.softDelete(id);
    }

    private async getEmployeeOrFail(id: number): Promise<Employee> {
        const employee = await this.employeesRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!employee) {
            this.logger.error(`Employee not found with id: ${id}`);
            throw new NotFoundException('Funcionário não encontrado');
        }

        return employee;
    }

    private async getUserOrFail(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            this.logger.error(`User not found with id: ${id}`);
            throw new NotFoundException('Utilizador não encontrado');
        }

        return user;
    }
}
