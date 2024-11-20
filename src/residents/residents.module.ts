import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Resident } from './entities/resident.entity';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';

@Module({
    imports: [TypeOrmModule.forFeature([Resident, User]), ConfigModule],
    controllers: [ResidentsController],
    providers: [ResidentsService],
})
export class ResidentsModule {}
