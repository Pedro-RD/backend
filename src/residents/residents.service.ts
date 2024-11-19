import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { Role } from '../enums/roles.enum';
import PagedResponse from '../interfaces/paged-response.interface';
import QueryParams from '../interfaces/query-params.interface';
import { User } from '../users/entities/user.entity';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { Resident } from './entities/resident.entity';

@Injectable()
export class ResidentsService {
    logger = new Logger(ResidentsService.name);

    constructor(
        @InjectRepository(Resident)
        private readonly residentsRepository: Repository<Resident>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(createResidentDto: CreateResidentDto) {
        this.logger.log(
            'Creating resident',
            JSON.stringify({
                ...createResidentDto,
            }),
        );

        let relatives = [];
        if (createResidentDto.relatives) {
            relatives = await this.usersRepository.find({
                where: { id: In(createResidentDto.relatives) },
            });
        }

        if (createResidentDto.relatives && relatives.length !== createResidentDto.relatives.length) {
            this.logger.error('One or more relatives do not exist', JSON.stringify(createResidentDto.relatives), JSON.stringify(relatives));
            throw new NotFoundException('One or more relatives do not exist');
        }

        relatives.forEach((relative) => {
            if (relative.role !== Role.Relative) {
                this.logger.error('One or more users are not relatives', JSON.stringify(createResidentDto.relatives), JSON.stringify(relatives));
                throw new NotFoundException('One or more users are not relatives');
            }
        });

        const resident = this.residentsRepository.create({
            ...createResidentDto,
            relatives,
        });

        const newResident = await this.residentsRepository.save(resident);
        this.logger.log('Resident created', JSON.stringify(newResident));
        return plainToClass(Resident, newResident);
    }

    async findAll({ page, limit, orderBy, order, search }: QueryParams): Promise<PagedResponse<Resident>> {
        this.logger.log('Finding all residents', JSON.stringify({ page, limit, orderBy, order, search }));
        const queryBuilder = this.residentsRepository.createQueryBuilder('resident');
        queryBuilder.leftJoinAndSelect('resident.relatives', 'relative');

        if (search) {
            queryBuilder.where(
                'resident.name ILIKE :search OR resident.fiscalId ILIKE :search OR resident.specificCare ILIKE :search OR resident.nationality ILIKE :search OR resident.dietRestrictions ILIKE :search OR resident.allergies ILIKE :search',
                {
                    search: `%${search}%`,
                },
            );
        }

        const [residents, totalCount] = await queryBuilder
            .orderBy(`resident.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        this.logger.log('Residents found', JSON.stringify(residents), 'Total count', totalCount);

        return {
            data: residents.map((resident) => plainToClass(Resident, resident)),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(id: number) {
        this.logger.log('Finding resident', JSON.stringify({ id }));
        const resident = await this.residentsRepository.findOne({
            where: { id: +id },
            relations: ['relatives'],
        });

        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException(`Resident not found`);
        }

        this.logger.log('Resident found', JSON.stringify(resident));
        return plainToClass(Resident, resident);
    }

    async update(id: number, updateResidentDto: UpdateResidentDto) {
        this.logger.log(
            'Updating resident',
            JSON.stringify({
                ...updateResidentDto,
            }),
        );
        let relatives = [];

        if (updateResidentDto.relatives) {
            relatives = await this.usersRepository.find({
                where: { id: In(updateResidentDto.relatives) },
            });
        }

        if (updateResidentDto.relatives && relatives.length !== updateResidentDto.relatives.length) {
            this.logger.error('One or more relatives do not exist', JSON.stringify(updateResidentDto.relatives), JSON.stringify(relatives));
            throw new NotFoundException('One or more relatives do not exist');
        }

        relatives.forEach((relative) => {
            if (relative.role !== Role.Relative) {
                this.logger.error('One or more users are not relatives', JSON.stringify(updateResidentDto.relatives), JSON.stringify(relatives));
                throw new NotFoundException('One or more users are not relatives');
            }
        });

        const resident = await this.residentsRepository.preload({
            id: +id,
            ...updateResidentDto,
            relatives,
        });

        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException(`Resident not found`);
        }

        const updatedResident = await this.residentsRepository.save(resident);
        this.logger.log('Resident updated', JSON.stringify(updateResidentDto));

        return plainToClass(Resident, updatedResident);
    }

    async remove(id: number): Promise<void> {
        this.logger.log('Removing resident', JSON.stringify({ id }));
        await this.getResidentOrFail(id);
        this.logger.log('Resident removed', JSON.stringify({ id }));
        await this.residentsRepository.softDelete(id);
    }

    private async getResidentOrFail(id: number): Promise<Resident> {
        const resident = await this.residentsRepository.findOne({ where: { id } });
        if (!resident) {
            this.logger.error('Resident not found', JSON.stringify({ id }));
            throw new NotFoundException('Resident not found');
        }
        return resident;
    }
}
