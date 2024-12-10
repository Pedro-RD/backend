import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { QueryParamsMedicamentAdministrationDto } from '../query/query-params-medicament-administration.dto';
import { MedicamentAdministrationDTO } from './dto/create-medicament-administration.dto';
import { MedicamentAdministration } from './entities/medicament-administration.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MedicamentAdministrationService {
    private readonly logger = new Logger(MedicamentAdministrationService.name);
    constructor(
        private readonly eventEmitter: EventEmitter2,
        @InjectRepository(MedicamentAdministration) private readonly medicamentAdministrationRepository: Repository<MedicamentAdministration>,
        @InjectRepository(Medicament) private readonly medicamentsRepository: Repository<Medicament>,
    ) {}
    async create(medicamentId: number, createMedicamentAdministrationDto: MedicamentAdministrationDTO) {
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

            const result = await this.medicamentAdministrationRepository.save(medicamentAdministration);
            this.logger.log(`Medicament administration created: ${result.id}`);
            const rxp = plainToClass(MedicamentAdministration, result);
            return {
                ...rxp,
                hour: `${String(rxp.hour).padStart(2, '0')}:${String(rxp.minute).padStart(2, '0')}`,
            };
        } catch (e) {
            this.logger.error(`An error occurred while creating the medicament administration: ${e?.message}`);
            throw new BadRequestException('Um erro ocorreu ao criar a administração do medicamento');
        }
    }

    async findAll({ page, limit, orderBy, order, search, medicamentId }: QueryParamsMedicamentAdministrationDto) {
        const queryBuilder = this.medicamentAdministrationRepository.createQueryBuilder('medicamentAdministration');
        queryBuilder.leftJoinAndSelect('medicamentAdministration.medicament', 'medicament');
        if (medicamentId) {
            queryBuilder.where('medicamentAdministration.medicament.id = :medicamentId', {
                medicamentId: medicamentId,
            });
        }

        // search in all fields if present
        if (search) {
            queryBuilder.orWhere('medicamentAdministration.dose ILIKE :search', {
                search: `%${search}%`,
            });
        }

        const [medicamentAdministrations, totalCount] = await queryBuilder
            .orderBy(`medicamentAdministration.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: medicamentAdministrations
                .map((medicamentAdministration) => plainToClass(MedicamentAdministration, medicamentAdministration))
                .map((rxp) => ({
                    ...rxp,
                    hour: `${String(rxp.hour).padStart(2, '0')}:${String(rxp.minute).padStart(2, '0')}`,
                })),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(medicamentId: number, id: number) {
        const result = await this.getMedicamentAdministration(medicamentId, id);
        if (!result) {
            throw new NotFoundException(`A administração do medicamento não foi encontrada`);
        }

        return {
            ...plainToClass(MedicamentAdministration, result),
            hour: `${String(result.hour).padStart(2, '0')}:${String(result.minute).padStart(2, '0')}`,
        };
    }

    async update(medicamentId: number, id: number, updateMedicamentAdministrationDto: MedicamentAdministrationDTO) {
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

        const result = await this.medicamentAdministrationRepository.save(medicamentAdministration);
        this.logger.log(`Medicament administration updated: ${result.id}`);
        const rxp = plainToClass(MedicamentAdministration, result);
        return {
            ...rxp,
            hour: `${String(rxp.hour).padStart(2, '0')}:${String(rxp.minute).padStart(2, '0')}`,
        };
    }

    async remove(medicamentId: number, id: number) {
        await this.getMedicamentAdministration(medicamentId, id);
        await this.medicamentAdministrationRepository.softDelete(id);
    }

    private async getMedicamentAdministration(medicamentId: number, id: number): Promise<MedicamentAdministration> {
        const medicamentAdministration = await this.medicamentAdministrationRepository.findOne({
            where: { id, medicament: { id: medicamentId } },
            relations: ['medicament'],
        });
        if (!medicamentAdministration) throw new NotFoundException('Medicament administration report not found');
        return medicamentAdministration;
    }

    // at every 15 minutes check medicament administrations that are due in 5 minutes from now
    @Cron('0 */5 * * * *', { timeZone: 'Europe/Lisbon' })
    async handleMedicamentAdministrationDue() {
        let startHour = new Date().getHours();
        let startMinute = new Date().getMinutes() + 5;
        if (startMinute >= 60) {
            startHour += 1;
            startMinute -= 60;
        }

        if (startHour >= 24) {
            startHour = 0;
        }

        const endMinute = startMinute + 4;

        this.logger.log(`Checking medicament administrations due between ${startHour}:${startMinute} and ${startHour}:${endMinute}`);

        const medicamentAdministrations = await this.medicamentAdministrationRepository
            .createQueryBuilder('medicamentAdministration')
            .leftJoinAndSelect('medicamentAdministration.medicament', 'medicament')
            .leftJoinAndSelect('medicament.resident', 'resident')
            .where('medicamentAdministration.hour = :startHour', { startHour })
            .andWhere('medicamentAdministration.minute >= :startMinute', { startMinute })
            .andWhere('medicamentAdministration.minute <= :endMinute', { endMinute })
            .getMany();

        medicamentAdministrations.forEach((medicamentAdministration) => {
            this.eventEmitter.emit('medicament.administration.due', new MedicamentAdministrationEvent(medicamentAdministration));
        });

        this.logger.log('Medicament administrations checked');
    }
}

export class MedicamentAdministrationEvent {
    date: Date;
    administration: MedicamentAdministration;
    constructor(medicamentAdministration: MedicamentAdministration) {
        const today = new Date();
        this.date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), medicamentAdministration.hour, medicamentAdministration.minute);
        this.administration = medicamentAdministration;
    }
}
