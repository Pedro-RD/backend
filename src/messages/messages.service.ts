import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Role } from '../enums/roles.enum';
import { Resident } from '../residents/entities/resident.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryParamsMessagesDto } from './dto/query-params-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @InjectRepository(Resident) private readonly residentRepository: Repository<Resident>,
    ) {}

    async create(residentId: number, user: User, createMessageDto: CreateMessageDto) {
        this.logger.log(`User ${user.id} is creating a message for resident ${residentId}`);

        const resident = await this.residentRepository.findOne({
            where: { id: residentId },
            relations: ['relatives'],
        });

        if (!resident) {
            this.logger.error(`Resident ${residentId} not found`);
            throw new NotFoundException(`Residente com ID ${residentId} não encontrado`);
        }

        if (user.role !== Role.Manager && user.role !== Role.Caretaker && !resident.relatives.some((relative) => relative.id === user.id)) {
            this.logger.error(`User ${user.id} is not allowed to create a message for resident ${residentId}`);
            throw new ForbiddenException('O utilizador não tem permissão para criar uma mensagem para este residente');
        }

        const message = this.messageRepository.create({
            ...createMessageDto,
            resident,
            user,
        });

        const result = await this.messageRepository.save(message);

        this.logger.log(`Message ${result.id} created for resident ${residentId} by user ${user.id}`);
        const rxp = plainToClass(Message, result);

        // load resident
        this.eventEmitter.emit('message.created', result);
        return { ...rxp, user: { id: rxp.user.id, email: rxp.user.email, name: rxp.user.name, role: rxp.user.role } };
    }

    async findAll(residentId: number, user: User, { orderBy, order, page, limit, search }: QueryParamsMessagesDto) {
        this.logger.log(`User ${user.id} is fetching messages for resident ${residentId}`);

        const resident = await this.residentRepository.findOne({
            where: { id: residentId },
            relations: ['relatives'],
        });

        if (!resident) {
            this.logger.error(`Resident ${residentId} not found`);
            throw new NotFoundException(`Residente com ID ${residentId} não encontrado`);
        }

        if (user.role !== Role.Manager && user.role !== Role.Caretaker && !resident.relatives.some((relative) => relative.id === user.id)) {
            this.logger.error(`User ${user.id} is not allowed to fetch messages for resident ${residentId}`);
            throw new ForbiddenException('O utilizador não tem permissão para aceder a estas mensagens');
        }

        const queryBuilder = this.messageRepository.createQueryBuilder('message');
        queryBuilder.leftJoinAndSelect('message.user', 'user');
        queryBuilder.leftJoinAndSelect('message.resident', 'resident');

        queryBuilder.where('resident.id = :residentId', { residentId });

        if (search) {
            queryBuilder.andWhere('message.content ILIKE :search', { search: `%${search}%` });
        }

        const [messages, total] = await queryBuilder
            .orderBy(`message.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        this.logger.log(`Found ${messages.length} messages for resident ${residentId} by user ${user.id}`);
        return {
            data: messages
                .map((message) => plainToClass(Message, message))
                .map((message) => ({ ...message, user: { id: message.user.id, email: message.user.email, name: message.user.name, role: message.user.role } })),
            page,
            limit,
            totalCount: total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(residentId: number, user: User, id: number) {
        this.logger.log(`User ${user.id} is fetching message ${id} for resident ${residentId}`);

        const message = await this.messageRepository.findOne({
            where: { id, resident: { id: residentId } },
            relations: ['user', 'resident', 'resident.relatives'],
        });

        if (!message) {
            this.logger.error(`Message ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`Mensagem com ID ${id} não encontrada para o residente com ID ${residentId}`);
        }

        if (user.role !== Role.Manager && user.role !== Role.Caretaker && !message.resident.relatives.some((relative) => relative.id === user.id)) {
            this.logger.error(`User ${user.id} is not allowed to fetch message ${id} for resident ${residentId}`);
            throw new ForbiddenException('O utilizador não tem permissão para aceder a esta mensagem');
        }

        this.logger.log(`Message ${id} found for resident ${residentId} by user ${user.id}`);

        const rxp = plainToClass(Message, message);
        return { ...rxp, user: { id: rxp.user.id, email: rxp.user.email, name: rxp.user.name, role: rxp.user.role } };
    }

    async update(residentId: number, user: User, id: number, updateMessageDto: UpdateMessageDto) {
        this.logger.log(`User ${user.id} is updating message ${id} for resident ${residentId}`);

        const message = await this.messageRepository.findOne({
            where: { id, resident: { id: residentId } },
            relations: ['user', 'resident'],
        });

        if (!message) {
            this.logger.error(`Message ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`Mensagem com ID ${id} não encontrada para o residente com ID ${residentId}`);
        }

        if (user.role !== Role.Manager && user.role !== Role.Caretaker && user.id !== message.user.id) {
            this.logger.error(`User ${user.id} is not allowed to update message ${id} for resident ${residentId}`);
            throw new ForbiddenException('O utilizador não tem permissão para atualizar esta mensagem');
        }

        const updatedMessage = await this.messageRepository.save({
            ...message,
            ...updateMessageDto,
        });

        this.logger.log(`Message ${id} updated for resident ${residentId} by user ${user.id}`);
        const rxp = plainToClass(Message, updatedMessage);
        return { ...rxp, user: { id: rxp.user.id, email: rxp.user.email, name: rxp.user.name, role: rxp.user.role } };
    }

    async remove(residentId: number, user: User, id: number) {
        this.logger.log(`User ${user.id} is deleting message ${id} for resident ${residentId}`);

        const message = await this.messageRepository.findOne({
            where: { id, resident: { id: residentId } },
            relations: ['user', 'resident'],
        });

        if (!message) {
            this.logger.error(`Message ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`Mensagem com ID ${id} não encontrada para o residente com ID ${residentId}`);
        }

        if (user.role !== Role.Manager && user.role !== Role.Caretaker && user.id !== message.user.id) {
            this.logger.error(`User ${user.id} is not allowed to delete message ${id} for resident ${residentId}`);
            throw new ForbiddenException('O utilizador não tem permissão para eliminar esta mensagem');
        }

        await this.messageRepository.delete(id);

        this.logger.log(`Message ${id} deleted for resident ${residentId} by user ${user.id}`);
    }
}
