import { Module } from '@nestjs/common';
import { MedicamentsService } from './medicaments.service';
import { MedicamentsController } from './medicaments.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Resident } from "../residents/entities/resident.entity";
import { Medicament } from "./entities/medicament.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Medicament, Resident])],
  controllers: [MedicamentsController],
  providers: [MedicamentsService],
})
export class MedicamentsModule {}
