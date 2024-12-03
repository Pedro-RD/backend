import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';

import { Role } from '../enums/roles.enum';
import PagedResponse from '../interfaces/paged-response.interface';
import { Resident } from '../residents/entities/resident.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDTO } from './dto/password-reset.dto';
import { QueryParamsUsersDto } from './dto/query-params-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    logger = new Logger(UsersService.name);
    private readonly saltRounds = 10;

    @InjectRepository(User) private usersRepository: Repository<User>;
    @InjectRepository(Resident) private readonly residentsRepository: Repository<Resident>;

    async create(createUserDto: CreateUserDto): Promise<User> {
        this.logger.log(
            'Creating user',
            JSON.stringify({
                ...createUserDto,
                password: '*******',
            }),
        );
        // Check if email already exists
        await this.checkIfEmailExists(createUserDto.email);

        // Hash password
        if (!createUserDto.password) throw new BadRequestException('Password is required');
        createUserDto.password = await bcrypt.hash(createUserDto.password, this.saltRounds);

        // Find associated residents
        let residents = [];
        if (createUserDto.residents)
            residents = await this.residentsRepository.find({
                where: { id: In(createUserDto.residents) },
            });

        //Check if all residents exist
        if (createUserDto.residents && residents.length !== createUserDto.residents.length) {
            this.logger.error('One or more residents do not exist', JSON.stringify(createUserDto.residents), JSON.stringify(residents));
            throw new BadRequestException('One or more residents do not exist');
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            residents,
        });

        // Save and return user
        await this.usersRepository.save(user);
        this.logger.log('User created', JSON.stringify(user));
        return plainToClass(User, user);
    }

    async findAll({ page, limit, orderBy, order, role, search }: QueryParamsUsersDto): Promise<PagedResponse<User>> {
        try {
            this.logger.log('Finding all users', JSON.stringify({ page, limit, orderBy, order, role, search }));
            // Create query builder
            const queryBuilder = this.usersRepository.createQueryBuilder('user');
            queryBuilder.leftJoinAndSelect('user.residents', 'resident');
            queryBuilder.leftJoinAndSelect('user.employee', 'employee');

            // Apply filters (search, role)
            if (role && !search) {
                queryBuilder.where('user.role = :role', { role });
            } else if (search && !role) {
                queryBuilder.where(
                    'user.email ILIKE :search OR user.name ILIKE :search OR user.phoneNumber ILIKE :search OR user.address ILIKE :search OR user.postcode ILIKE :search OR user.city ILIKE :search OR user.fiscalId ILIKE :search',
                    { search: `%${search}%` },
                );
            } else if (search && role) {
                queryBuilder.where(
                    '(user.email ILIKE :search OR user.name ILIKE :search OR user.phoneNumber ILIKE :search OR user.address ILIKE :search OR user.postcode ILIKE :search OR user.city ILIKE :search OR user.fiscalId ILIKE :search) AND user.role = :role',
                    { search: `%${search}%`, role },
                );
            }

            // Apply pagination
            const [users, totalCount] = await queryBuilder
                .orderBy(`user.${orderBy}`, order)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();

            this.logger.log('Users found:', JSON.stringify(users), 'Total:', totalCount);
            // Return paged response
            return {
                data: users.map((user) => plainToClass(User, user)),
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };
        } catch (error) {
            this.logger.error('Error finding users', error);
            throw new BadRequestException('Query parameters are not valid');
        }
    }

    async findOne(id: number): Promise<User> {
        this.logger.log('Finding user', id);
        // Find user
        const user = await this.getUserOrFail(id);
        this.logger.log('User found', JSON.stringify(user));
        // Return user
        return plainToClass(User, user);
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        this.logger.log('Updating user:', id, JSON.stringify(updateUserDto));

        // Verify if user exists
        const user = await this.getUserOrFail(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) await this.checkIfEmailExists(updateUserDto.email);

        // If the user is a relative, check if the residents exist
        const residents =
            user.role === Role.Relative || updateUserDto.role === Role.Relative
                ? updateUserDto.residents && updateUserDto.residents.length > 0
                    ? await this.residentsRepository.find({
                          where: { id: In(updateUserDto.residents) },
                      })
                    : user.residents
                : [];

        if (updateUserDto.residents && residents.length !== updateUserDto.residents.length) {
            this.logger.error(
                'One or more residents do not exist or the user is not a relative',
                JSON.stringify(updateUserDto.residents),
                JSON.stringify(residents),
            );
            throw new BadRequestException('One or more residents do not exist or the user is not a relative');
        }

        // Update user
        const updatedUser = await this.usersRepository.save({
            ...user,
            ...updateUserDto,
            residents,
        });

        this.logger.log('User updated', JSON.stringify(updatedUser));

        // Return updated user
        return plainToClass(User, updatedUser);
    }

    async remove(id: number): Promise<void> {
        this.logger.log('Deleting user', id);
        // Verify if user exists
        await this.getUserOrFail(id);
        // Soft delete user
        await this.usersRepository.softDelete(id);
    }

    async login(email: string, password: string): Promise<User> {
        this.logger.log('Logging in user', email);
        // Find user by email
        const user = await this.usersRepository.findOne({ where: { email }, relations: ['residents'] });
        this.logger.log('User with email:', JSON.stringify(user));
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        this.logger.log('Password is valid:', isPasswordValid);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        // Return user
        return plainToClass(User, user);
    }

    async resetPassword(id: number, { password }: ResetPasswordDTO): Promise<void> {
        this.logger.log('Resetting password for user', id);
        // Verify if user exists
        await this.getUserOrFail(id);
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        // Update password
        await this.usersRepository.update(id, { password: hashedPassword });
        this.logger.log('The password has been reset', id);
    }

    private async getUserOrFail(id: number): Promise<User> {
        // Find user
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['residents', 'employee'],
        });
        // Check if user exists if not throw BadRequestException  400
        if (!user) {
            this.logger.error('User not found', id);
            throw new NotFoundException('User not found');
        }
        // Return user
        return user;
    }

    private async checkIfEmailExists(email: string): Promise<void> {
        // Check if email already exists to avoid duplicates
        const user = await this.usersRepository.findOne({ where: { email } });
        if (user) {
            this.logger.error(`Email ${email} already in use`);
            throw new BadRequestException('Email already in use');
        }
    }
}
