import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { MedicamentAdministration } from './entities/medicament-administration.entity';
import { MedicamentAdministrationController } from './medicament-administration.controller';
import { MedicamentAdministrationService } from './medicament-administration.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([MedicamentAdministration, Medicament]), UsersModule, AuthModule],
    controllers: [MedicamentAdministrationController],
    providers: [MedicamentAdministrationService],
})
export class MedicamentAdministrationModule {}
