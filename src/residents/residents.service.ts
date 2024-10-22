import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Resident } from "./entities/resident.entity";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentsRepository: Repository<Resident>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {  }
  async create(createResidentDto: CreateResidentDto) {
    let relatives = [];

    if (createResidentDto.relatives) {
      relatives = await this.usersRepository.findByIds(createResidentDto.relatives);
    }

    const resident = await this.residentsRepository.create({
      ...createResidentDto,
      relatives
    });

    return this.residentsRepository.save(resident);
  }

  async findAll() {
    return this.residentsRepository.find({
      relations: ['relatives'],
    });
  }

  async findOne(id: number) {
    const resident = await this.residentsRepository.findOne({
      where: { id: +id },
      relations: ['relatives'],
    });

    if (!resident) {
      throw new NotFoundException(`Resident not found`);
    }
    return resident;
  }

  async update(id: number, updateResidentDto: UpdateResidentDto) {
    let relatives = [];

    if (updateResidentDto.relatives) {
      relatives = await this.usersRepository.findByIds(updateResidentDto.relatives);
    }

    const resident = await this.residentsRepository.preload({
      id: +id,
      ...updateResidentDto,
      relatives,
    });
    if (!resident) {
      throw new NotFoundException(`Resident not found`);
    }

    return this.residentsRepository.save(resident);


    /*let relatives = [];

    if (updateResidentDto.relatives) {
      relatives = await this.usersRepository.findByIds(updateResidentDto.relatives);
    }

    const resident = await this.residentsRepository.update(id, {
      ...updateResidentDto,
      relatives
    });

    if (!resident) {
      throw new NotFoundException(`Resident not found`);
    }

    return resident; */
  }

  async remove(id: number): Promise<string> {
    await this.getResidentOrFail(id)
    await this.residentsRepository.softDelete(id);
    return 'success';
  }

  private async getResidentOrFail(id: number): Promise<Resident> {
    const resident = await this.residentsRepository.findOne({ where: { id } });
    if (!resident) throw new NotFoundException('Resident not found');
    return resident;
  }
}
