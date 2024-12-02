import { Module } from '@nestjs/common';
import { HealthReportService } from './health-report.service';
import { HealthReportController } from './health-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { HealthReport } from './entities/health-report.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Resident, HealthReport]), UsersModule, AuthModule],
    controllers: [HealthReportController],
    providers: [HealthReportService],
})
export class HealthReportModule {}
