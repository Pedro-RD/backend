import { Module } from '@nestjs/common';
import { MedicamentAdministrationService } from './medicament-administration.service';
import { MedicamentAdministrationController } from './medicament-administration.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicamentAdministration } from "./entities/medicament-administration.entity";
import { Medicament } from "../medicaments/entities/medicament.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MedicamentAdministration, Medicament])],
  controllers: [MedicamentAdministrationController],
  providers: [MedicamentAdministrationService],
})
export class MedicamentAdministrationModule {}
