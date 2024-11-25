import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { CreateHealthReportDto } from './dto/create-health-report.dto';
import { QueryParamsHealthReportDto } from './dto/query-params-health-report.dto';
import { UpdateHealthReportDto } from './dto/update-health-report.dto';
import { HealthReport } from './entities/health-report.entity';

@Injectable()
export class HealthReportService {
    logger = new Logger('HealthReportService');

    constructor(
        @InjectRepository(HealthReport)
        private readonly healthReportRepository: Repository<HealthReport>,
        @InjectRepository(Resident)
        private readonly residentsRepository: Repository<Resident>,
    ) {}

    async create(residentId: number, createHealthReportDto: CreateHealthReportDto) {
        this.logger.log(`Creating health report for resident ${residentId} with data ${JSON.stringify(createHealthReportDto)}`);
        const resident = await this.residentsRepository.findOne({
            where: { id: residentId },
        });

        if (!resident) {
            throw new NotFoundException('Residente não encontrado');
        }

        const healthReport = this.healthReportRepository.create({
            ...createHealthReportDto,
            resident,
        });

        const result = await this.healthReportRepository.save(healthReport);
        this.logger.log(`Health report created with id ${result.id} for resident ${residentId}`);
        return plainToClass(HealthReport, result);
    }

    async findAll(residentId: number, { search, orderBy, order, from, to, limit, page }: QueryParamsHealthReportDto) {
        this.logger.log(
            `Finding health reports for resident ${residentId} with query params ${JSON.stringify({ search, orderBy, order, from, to, limit, page })}`,
        );
        const queryBuilder = this.healthReportRepository.createQueryBuilder('healthReport');

        queryBuilder.where('healthReport.residentId = :residentId', { residentId });
        if (from) {
            queryBuilder.andWhere('healthReport.createdAt >= :from', { from });
        }
        if (to) {
            queryBuilder.andWhere('healthReport.createdAt <= :to', { to });
        }
        if (search) {
            queryBuilder.andWhere(
                `(healthReport.cognitiveEmotionalAssessment ILIKE :search OR healthReport.mobility ILIKE :search OR healthReport.hydrationLevel ILIKE :search)`,
                {
                    search: `%${search}%`,
                },
            );
        }

        const [healthReports, totalCount] = await queryBuilder
            .orderBy(`healthReport.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        this.logger.log(`Found ${healthReports.length} health reports for resident ${residentId}, total count: ${totalCount}`);
        return {
            data: healthReports.map((report) => plainToClass(HealthReport, report)),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(residentId: number, id: number) {
        this.logger.log(`Finding health report ${id} for resident ${residentId}`);
        const result = await this.getHealthReportOrFail(id);
        if (result.resident.id !== residentId) {
            this.logger.error(`Health report ${id} does not belong to resident ${residentId}`);
            throw new NotFoundException('Relatório de saúde não encontrado');
        }
        this.logger.log(`Health report ${id} found for resident ${residentId}: ${JSON.stringify(result)}`);
        return plainToClass(HealthReport, result);
    }

    async update(residentId: number, id: number, updateHealthReportDto: UpdateHealthReportDto) {
        this.logger.log(`Updating health report ${id} for resident ${residentId} with data ${JSON.stringify(updateHealthReportDto)}`);
        const resident = await this.residentsRepository.findOne({
            where: { id: residentId },
        });

        if (!resident) {
            this.logger.error(`Resident ${residentId} not found`);
            throw new NotFoundException('Residente não encontrado');
        }

        const healthReport = await this.healthReportRepository.findOne({
            where: { id },
            relations: ['resident'],
        });

        if (!healthReport) {
            throw new NotFoundException(`Health report not found`);
        } else if (healthReport.resident.id !== residentId) {
            this.logger.error(`Health report ${id} does not belong to resident ${residentId}`);
            throw new NotFoundException('Relatório de saúde não encontrado');
        }

        const result = await this.healthReportRepository.save({
            ...healthReport,
            ...updateHealthReportDto,
        });
        this.logger.log(`Health report ${id} updated for resident ${residentId} with data ${JSON.stringify(updateHealthReportDto)}`);
        return plainToClass(HealthReport, result);
    }

    async remove(residentId: number, id: number) {
        this.logger.log(`Deleting health report ${id}`);
        const report = await this.getHealthReportOrFail(id);
        if (report.resident.id !== residentId) {
            this.logger.error(`Health report ${id} does not belong to resident ${residentId}`);
            throw new NotFoundException('Relatório de saúde não encontrado');
        }
        await this.healthReportRepository.softDelete(id);
        this.logger.log(`Health report ${id} deleted`);
    }

    private async getHealthReportOrFail(id: number): Promise<HealthReport> {
        const healthReport = await this.healthReportRepository.findOne({
            where: { id },
            relations: ['resident'],
        });

        if (!healthReport) {
            this.logger.error(`Health report ${id} not found`);
            throw new NotFoundException('Relatório de saúde não encontrado');
        }

        this.logger.log(`Health report ${id} found: ${JSON.stringify(healthReport)}`);
        return healthReport;
    }
}
