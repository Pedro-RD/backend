import { Module } from '@nestjs/common';
import { MedicamentsService } from './medicaments.service';
import { MedicamentsController } from './medicaments.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Resident } from "../residents/entities/resident.entity";
import { Medicament } from "./entities/medicament.entity";
import { MedicamentAdministration } from "../medicament-administration/entities/medicament-administration.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Medicament, Resident, MedicamentAdministration])],
  controllers: [MedicamentsController],
  providers: [MedicamentsService],
})
export class MedicamentsModule {}
