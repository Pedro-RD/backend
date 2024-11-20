import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import PagedResponse from '../interfaces/paged-response.interface';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { QueryParamsMedicamentAdministrationDto } from '../query/query-params-medicament-administration.dto';
import { CreateMedicamentAdministrationDto } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';
import { MedicamentAdministration } from './entities/medicament-administration.entity';

@Injectable()
export class MedicamentAdministrationService {
    constructor(
        @InjectRepository(MedicamentAdministration)
        private readonly medicamentAdministrationRepository: Repository<MedicamentAdministration>,
        @InjectRepository(Medicament)
        private readonly medicamentsRepository: Repository<Medicament>,
    ) {}
    async create(medicamentId: number, createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
        const medicament = await this.medicamentsRepository.findOne({
            where: { id: medicamentId },
        });

        if (!medicament) {
            throw new NotFoundException(`Medicament not found`);
        }

        try {
            const medicamentAdministration = this.medicamentAdministrationRepository.create({
                ...createMedicamentAdministrationDto,
                medicament,
            });

            return await this.medicamentAdministrationRepository.save(medicamentAdministration);
        } catch (e) {
            throw new BadRequestException('An error occurred while creating the medicament administration.');
        }
    }

    async findAll({
        page,
        limit,
        orderBy,
        order,
        search,
        medicamentId,
    }: QueryParamsMedicamentAdministrationDto): Promise<PagedResponse<MedicamentAdministration>> {
        const queryBuilder = this.medicamentAdministrationRepository.createQueryBuilder('medicamentAdministration');
        queryBuilder.leftJoinAndSelect('medicamentAdministration.medicament', 'medicament');

        // search in all fields if present
        if (search) {
            queryBuilder.where('medicamentAdministration.hour ILIKE :search', {
                search: `%${search}%`,
            });
            queryBuilder.orWhere('medicamentAdministration.dose ILIKE :search', {
                search: `%${search}%`,
            });
        }

        if (medicamentId) {
            queryBuilder.where('medicamentAdministration.medicament.id = :medicamentId', {
                medicamentId: medicamentId,
            });
        }

        const [medicamentAdministrations, totalCount] = await queryBuilder
            .orderBy(`medicamentAdministration.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: medicamentAdministrations.map((medicamentAdministration) => plainToClass(MedicamentAdministration, medicamentAdministration)),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(medicamentId: number, id: number) {
        return await this.getMedicamentAdministration(medicamentId, id);
    }

    async update(medicamentId: number, id: number, updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto) {
        const medicament = await this.medicamentsRepository.findOne({
            where: { id: medicamentId },
        });

        if (!medicament) {
            throw new NotFoundException(`Medicament not found`);
        }

        const medicamentAdministration = await this.medicamentAdministrationRepository.preload({
            id: +id,
            ...updateMedicamentAdministrationDto,
        });

        if (!medicamentAdministration) {
            throw new NotFoundException(`Medicament administration report not found`);
        }

        return this.medicamentAdministrationRepository.save(medicamentAdministration);
    }

    async remove(medicamentId: number, id: number) {
        await this.getMedicamentAdministration(medicamentId, id);
        await this.medicamentAdministrationRepository.softDelete(id);
        return 'success';
    }

    private async getMedicamentAdministration(medicamentId: number, id: number): Promise<MedicamentAdministration> {
        const medicamentAdministration = await this.medicamentAdministrationRepository.findOne({
            where: { id, medicament: { id: medicamentId } },
            relations: ['medicament'],
        });
        if (!medicamentAdministration) throw new NotFoundException('Medicament administration report not found');
        return medicamentAdministration;
    }
}
