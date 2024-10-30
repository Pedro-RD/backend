import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateMedicamentAdministrationDto } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';
import { HealthReport } from "../health-report/entities/health-report.entity";
import { MedicamentAdministration } from "./entities/medicament-administration.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medicament } from "../medicaments/entities/medicament.entity";

@Injectable()
export class MedicamentAdministrationService {
  constructor(
    @InjectRepository(MedicamentAdministration)
    private readonly medicamentAdministrationRepository: Repository<MedicamentAdministration>,
    @InjectRepository(Medicament)
    private readonly medicamentsRepository: Repository<Medicament>,
  ) {
  }
  async create(createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
    let medicament = await this.medicamentsRepository.findOne({
      where: { id: createMedicamentAdministrationDto.medicament },
    });

    const medicamentAdministration = this.medicamentAdministrationRepository.create({
      ...createMedicamentAdministrationDto,
      medicament,
    });

    return await this.medicamentAdministrationRepository.save(medicamentAdministration);
  }

  async findAll() {
    return await this.medicamentAdministrationRepository.find({
      relations: ['medicament'],
    });
  }

  async findOne(id: number) {
    return await this.getMedicamentAdministration(id);
  }

  async update(id: number, updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto) {
    let medicament = await this.medicamentsRepository.findOne({
      where: { id: updateMedicamentAdministrationDto.medicament },
    });

    const medicamentAdministration = await this.medicamentAdministrationRepository.preload({
      id: +id,
      ...updateMedicamentAdministrationDto,
      medicament,
    });

    if (!medicamentAdministration) {
      throw new NotFoundException(`Medicament administration report not found`);
    }

    return this.medicamentAdministrationRepository.save(medicamentAdministration);
  }

  async remove(id: number) {
    await this.getMedicamentAdministration(id);
    await this.medicamentAdministrationRepository.softDelete(id);
    return 'success';
  }

  private async getMedicamentAdministration(id: number): Promise<MedicamentAdministration> {
    const medicamentAdministration = await this.medicamentAdministrationRepository.findOne({
      where: { id },
      relations: ['medicament'],
    });
    if (!medicamentAdministration) throw new NotFoundException('Medicament administration report not found');
    return medicamentAdministration;
  }
}
