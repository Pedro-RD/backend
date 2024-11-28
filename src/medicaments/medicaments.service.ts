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

@Injectable()
export class MedicamentsService {
    logger = new Logger('MedicamentsService');
    constructor(
        @InjectRepository(Medicament)
        private readonly medicamentsRepository: Repository<Medicament>,
        @InjectRepository(Resident)
        private readonly residentsRepository: Repository<Resident>,
    ) { }

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

        await this.medicamentsRepository.delete(id);
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
            throw new BadRequestException('Medicament with this name already exists for this resident');
        }
        this.logger.log('Medicament with name', name, 'does not exist for resident', residentId);
    }
}
