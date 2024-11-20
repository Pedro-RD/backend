import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicamentAdministration } from '../medicament-administration/entities/medicament-administration.entity';
import { Resident } from '../residents/entities/resident.entity';
import { Medicament } from './entities/medicament.entity';
import { MedicamentsController } from './medicaments.controller';
import { MedicamentsService } from './medicaments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Medicament, Resident, MedicamentAdministration])],
    controllers: [MedicamentsController],
    providers: [MedicamentsService],
})
export class MedicamentsModule {}
