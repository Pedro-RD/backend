import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Resident } from './entities/resident.entity';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Resident, User]), ConfigModule, UsersModule, AuthModule],
    controllers: [ResidentsController],
    providers: [ResidentsService],
    exports: [ResidentsService],
})
export class ResidentsModule {}
