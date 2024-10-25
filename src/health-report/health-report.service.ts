import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateHealthReportDto } from './dto/create-health-report.dto';
import { UpdateHealthReportDto } from './dto/update-health-report.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HealthReport } from "./entities/health-report.entity";
import { Resident } from "../residents/entities/resident.entity";

@Injectable()
export class HealthReportService {
  constructor(
    @InjectRepository(HealthReport)
    private readonly healthReportRepository: Repository<HealthReport>,
    @InjectRepository(Resident)
    private readonly residentsRepository: Repository<Resident>,
  ) {}

  async create(createHealthReportDto: CreateHealthReportDto) {
    let resident = await this.residentsRepository.findOne({
      where: { id: createHealthReportDto.resident },
    });

    const healthReport = this.healthReportRepository.create({
      ...createHealthReportDto,
      resident,
    });

    return await this.healthReportRepository.save(healthReport);
  }

  async findAll() {
    return await this.healthReportRepository.find({
      relations: ['resident'],
    });
  }

  async findOne(id: number) {
    return await this.getHealthReportOrFail(id);
  }

  async update(id: number, updateHealthReportDto: UpdateHealthReportDto) {
    let resident = await this.residentsRepository.findOne({
      where: { id: updateHealthReportDto.resident },
    });

    const healthReport = await this.healthReportRepository.preload({
      id: +id,
      ...updateHealthReportDto,
      resident,
    });

    if (!healthReport) {
      throw new NotFoundException(`Health report not found`);
    }

    return this.healthReportRepository.save(healthReport);
  }

  async remove(id: number) {
    await this.getHealthReportOrFail(id);
    await this.healthReportRepository.softDelete(id);
    return 'success';
  }

  private async getHealthReportOrFail(id: number): Promise<HealthReport> {
    const healthReport = await this.healthReportRepository.findOne({
        where: { id },
        relations: ['resident'],
    });
    if (!healthReport) throw new NotFoundException('Health report not found');
      return healthReport;
  }
}
