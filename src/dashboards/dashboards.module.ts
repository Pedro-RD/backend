import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Resident } from '../residents/entities/resident.entity';
import { HealthReport } from '../health-report/entities/health-report.entity';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { MedicamentAdministration } from '../medicament-administration/entities/medicament-administration.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Message } from '../messages/entities/message.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { NotificationEvent } from '../notifications/entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Employee,
            Resident,
            HealthReport,
            Medicament,
            MedicamentAdministration,
            Appointment,
            Payment,
            Message,
            Shift,
            NotificationEvent,
        ]),
        UsersModule,
        AuthModule,
    ],
    controllers: [DashboardsController],
    providers: [DashboardsService],
})
export class DashboardsModule {}
