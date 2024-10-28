import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { Resident } from "../residents/entities/resident.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medicament } from "./entities/medicament.entity";

@Injectable()
export class MedicamentsService {
  constructor(
    @InjectRepository(Medicament)
    private readonly medicamentsRepository: Repository<Medicament>,
    @InjectRepository(Resident)
    private readonly residentsRepository: Repository<Resident>,
  ) {}

  async create(createMedicamentDto: CreateMedicamentDto) {
    let resident = await this.residentsRepository.findOne({
      where: { id: createMedicamentDto.resident },
    });

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const medicament = this.medicamentsRepository.create({
      ...createMedicamentDto,
      resident,
    });

    return await this.medicamentsRepository.save(medicament);
  }


  async findAll() {
    return await this.medicamentsRepository.find({
      relations: ['resident'],
    });
  }

  async findOne(id: number) {
    return await this.getMedicamentOrFail(id);
  }

  async update(id: number, updateMedicamentDto: UpdateMedicamentDto) {
    let resident = await this.residentsRepository.findOne({
      where: { id: updateMedicamentDto.resident },
    });

    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    const medicament = await this.medicamentsRepository.preload({
      id: +id,
      ...updateMedicamentDto,
      resident,
    });

    return this.medicamentsRepository.save(medicament);
  }

  async remove(id: number) {
    await this.getMedicamentOrFail(id);
    await this.medicamentsRepository.softDelete(id);
    return 'success';
  }

  private async getMedicamentOrFail(id: number): Promise<Medicament> {
    const medicament = await this.medicamentsRepository.findOne({
      where: { id },
      relations: ['resident'],
    });
    if (!medicament) throw new NotFoundException('Medicament not found');
    return medicament;
  }
}
