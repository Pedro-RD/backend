import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([Employee, Payment])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
