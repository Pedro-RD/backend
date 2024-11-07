import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from "./entities/employee.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { plainToClass } from "class-transformer";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    let user = await this.getUserOrFail(createEmployeeDto.user);

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

  async findAll() {
    //filters are missing
    const queryBuilder = this.employeesRepository.createQueryBuilder('employee');
    queryBuilder.leftJoinAndSelect('employee.user', 'user');

    const [employees, totalCount] = await queryBuilder
      .getManyAndCount();

    return {
      data: employees.map((employee) => plainToClass(Employee, employee)),
      totalCount,
    };
  }

  async findOne(id: number) {
    const employee = await this.getEmployeeOrFail(id);
    return plainToClass(Employee, employee)
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    let user = await this.getUserOrFail(updateEmployeeDto.user);

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
    return 'successfully deleted employee';
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
