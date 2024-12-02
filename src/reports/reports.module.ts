import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, Payment]), UsersModule, AuthModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
