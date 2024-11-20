import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { MedicamentAdministration } from './entities/medicament-administration.entity';
import { MedicamentAdministrationController } from './medicament-administration.controller';
import { MedicamentAdministrationService } from './medicament-administration.service';

@Module({
    imports: [TypeOrmModule.forFeature([MedicamentAdministration, Medicament])],
    controllers: [MedicamentAdministrationController],
    providers: [MedicamentAdministrationService],
})
export class MedicamentAdministrationModule {}
