import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import PagedResponse from '../interfaces/paged-response.interface';
import { QueryParamsMedicamentsDto } from '../query/query-params-medicaments.dto';
import { Resident } from '../residents/entities/resident.entity';
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { Medicament } from './entities/medicament.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MedicamentsService {
    logger = new Logger('MedicamentsService');
    constructor(
        private eventEmitter: EventEmitter2,
        @InjectRepository(Medicament) private readonly medicamentsRepository: Repository<Medicament>,
        @InjectRepository(Resident) private readonly residentsRepository: Repository<Resident>,
    ) {}

    async create(residentId: number, createMedicamentDto: CreateMedicamentDto) {
        this.logger.log('Creating medicament', createMedicamentDto);
        const resident = await this.checkResident(residentId);

        const medicament = this.medicamentsRepository.create({
            ...createMedicamentDto,
            resident,
        });
        await this.checkMedicamentName(medicament.name, residentId);
        const createdMedicament = await this.medicamentsRepository.save(medicament);

        return plainToClass(Medicament, createdMedicament);
    }

    async findAll(residentId: number, { page, limit, orderBy, order, search }: QueryParamsMedicamentsDto): Promise<PagedResponse<Medicament>> {
        this.logger.log('Finding all medicaments for resident', residentId, 'with query params', { page, limit, orderBy, order, search });
        const queryBuilder = this.medicamentsRepository.createQueryBuilder('medicament');
        await this.checkResident(residentId);

        queryBuilder.where('medicament.resident.id = :residentId', {
            residentId: residentId,
        });

        if (search) {
            queryBuilder.andWhere('medicament.name ILIKE :search', {
                search: `%${search}%`,
            });
        }

        const [medicaments, totalCount] = await queryBuilder
            .orderBy(`medicament.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: medicaments.map((medicament) => plainToClass(Medicament, medicament)),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(residentId: number, id: number) {
        this.logger.log('Finding medicament', id, 'for resident', residentId);
        const resident = await this.checkResident(residentId);
        const medicament = await this.getMedicamentOrFail(id);

        if (medicament.resident.id !== resident.id) {
            throw new NotFoundException('Medicament not found');
        }

        this.logger.log('Found medicament', medicament);
        return plainToClass(Medicament, medicament);
    }

    async update(residentId: number, id: number, updateMedicamentDto: UpdateMedicamentDto) {
        const resident = await this.checkResident(residentId);

        const medicament = await this.getMedicamentOrFail(id);

        if (medicament.resident.id !== resident.id) {
            throw new NotFoundException('Medicament not found');
        }

        if (!medicament) {
            this.logger.error('Medicament not found', id, 'for resident', residentId);
            throw new NotFoundException('Medicament not found');
        }

        this.logger.log('Updating medicament', id, 'for resident', residentId);

        if (updateMedicamentDto.name !== medicament.name) {
            await this.checkMedicamentName(updateMedicamentDto.name, residentId);
        }

        const updatedMedicament = await this.medicamentsRepository.save({
            ...medicament,
            ...updateMedicamentDto,
        });

        this.logger.log('Updated medicament', updatedMedicament);
        return plainToClass(Medicament, updatedMedicament);
    }

    async remove(residentId: number, id: number) {
        this.logger.log('Removing medicament', id, 'for resident', residentId);
        const resident = await this.checkResident(residentId);
        this.logger.log('Resident: ' + JSON.stringify(resident));
        const medicament = await this.getMedicamentOrFail(id);
        this.logger.log('Medicament: ' + JSON.stringify(medicament));

        if (medicament.resident.id !== resident.id) {
            throw new NotFoundException('Medicament not found');
        }

        await this.medicamentsRepository.softDelete(id);

        await Promise.all(
            medicament.medicamentAdministrations.map((medicamentAdministration) =>
                this.eventEmitter.emit('medicament.administration.deleted', medicamentAdministration),
            ),
        );

        this.logger.log('Removed medicament', id, 'for resident', residentId);
    }

    private async getMedicamentOrFail(id: number): Promise<Medicament> {
        this.logger.log('Getting medicament with id' + id);
        const medicament = await this.medicamentsRepository.findOne({
            where: { id },
            relations: ['resident', 'medicamentAdministrations'],
        });
        if (!medicament) {
            this.logger.error('Medicament not found: ' + id);
            throw new NotFoundException('Medicament not found');
        }
        this.logger.log('Found medicament' + JSON.stringify(medicament));
        return medicament;
    }

    private async checkResident(residentId: number): Promise<Resident> {
        this.logger.log('Checking if resident exists with id: ' + residentId);
        const resident = await this.residentsRepository.findOne({
            where: { id: residentId },
        });

        if (!resident) {
            this.logger.error('Resident not found', residentId);
            throw new NotFoundException('Resident with this id does not exist ' + residentId);
        }
        this.logger.log('Found resident: ' + JSON.stringify(resident));
        return resident;
    }

    private async checkMedicamentName(name: string, residentId: number): Promise<void> {
        this.logger.log('Checking if medicament with name', name, 'exists for resident', residentId);
        const medicament = await this.medicamentsRepository.findOne({
            where: { name, resident: { id: residentId } },
        });

        if (medicament) {
            this.logger.error('Medicament with name', name, 'already exists for resident', residentId);
            throw new BadRequestException('Um medicamento com este nome já existe para este residente');
        }
        this.logger.log('Medicament with name', name, 'does not exist for resident', residentId);
    }

    @OnEvent('medicament.administration.done', { async: true })
    async handleMedicamentAdministrationDoneEvent(payload: Medicament) {
        this.logger.log(`Medicament administration done event received for medicament ${payload.id}`);

        const medicament = await this.medicamentsRepository.findOne({
            where: { id: payload.id },
            relations: ['resident'],
        });

        if (medicament.quantity > 0) {
            medicament.quantity -= 1;
            await this.medicamentsRepository.save(medicament);
        }

        if (medicament.quantity === 0) {
            this.logger.log(`Medicament ${medicament.id} is out of stock`);
            this.eventEmitter.emit('medicament.out-of-stock', medicament);
        } else if (medicament.quantity <= 10) {
            this.logger.log(`Medicament ${medicament.id} is running low`);
            this.eventEmitter.emit('medicament.running-low', medicament);
        }
    }
}
