import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { Resident } from "../residents/entities/resident.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medicament } from "./entities/medicament.entity";
import QueryParams from "../interfaces/query-params.interface";
import PagedResponse from "../interfaces/paged-response.interface";
import { plainToClass } from "class-transformer";
import { QueryParamsMedicamentsDto } from "../query/query-params-medicaments.dto";

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


  async findAll({
    page,
    limit,
    orderBy,
    order,
    search,
    residentId,
  }: QueryParamsMedicamentsDto): Promise<PagedResponse<Medicament>> {
    const queryBuilder = this.medicamentsRepository.createQueryBuilder('medicament');
    queryBuilder.leftJoinAndSelect('medicament.resident', 'resident');

    // search in all fields if present
    if (search) {
      queryBuilder.where('medicament.name ILIKE :search', {
        search: `%${search}%`,
      });
      queryBuilder.orWhere('medicament.instructions ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (residentId) {
      queryBuilder.where('medicament.resident.id = :residentId', {
        residentId: residentId,
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
