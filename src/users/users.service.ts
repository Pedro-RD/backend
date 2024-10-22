import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import QueryParams from '../interfaces/query-params.interface';
import PagedResponse from '../interfaces/paged-response.interface'; 

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  @InjectRepository(User)
  private usersRepository: Repository<User>;

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.checkIfEmailExists(createUserDto.email);

    if (!createUserDto.password)
      throw new BadRequestException('Password is required');

    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    return plainToClass(User, user);
  }

  async findAll({ page, limit, orderBy, order }: QueryParams): Promise<PagedResponse<User>> {
    const [users, totalCount] = await this.usersRepository.findAndCount({
      order: { [orderBy]: order },
      take: limit,
      skip: (page - 1) * limit
    });

    return {
      data: users.map((user) => plainToClass(User, user)),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.getUserOrFail(id);
    return plainToClass(User, user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserOrFail(id);

    if (updateUserDto.email !== user.email)
      await this.checkIfEmailExists(updateUserDto.email);

    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });

    return plainToClass(User, updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.getUserOrFail(id);
    await this.usersRepository.softDelete(id);
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return plainToClass(User, user);
  }

  private async getUserOrFail(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async checkIfEmailExists(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('Email already in use');
  }
}
