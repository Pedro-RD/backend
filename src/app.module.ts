import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/entities/appointment.entity';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { Employee } from './employee/entities/employee.entity';
import { HealthReport } from './health-report/entities/health-report.entity';
import { HealthReportModule } from './health-report/health-report.module';
import { MedicamentAdministration } from './medicament-administration/entities/medicament-administration.entity';
import { MedicamentAdministrationModule } from './medicament-administration/medicament-administration.module';
import { Medicament } from './medicaments/entities/medicament.entity';
import { MedicamentsModule } from './medicaments/medicaments.module';
import { Message } from './messages/entities/message.entity';
import { MessagesModule } from './messages/messages.module';
import { Payment } from './payments/entities/payment.entity';
import { PaymentsModule } from './payments/payments.module';
import { Resident } from './residents/entities/resident.entity';
import { ResidentsModule } from './residents/residents.module';
import { Shift } from './shifts/entities/shift.entity';
import { ShiftsModule } from './shifts/shifts.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationEvent } from './notifications/entities/notification.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Employee, Resident, HealthReport, Medicament, MedicamentAdministration, Appointment, Payment, Message, Shift, NotificationEvent],
            synchronize: true,
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        AuthModule,
        UsersModule,
        ResidentsModule,
        HealthReportModule,
        MedicamentsModule,
        MedicamentAdministrationModule,
        EmployeeModule,
        AppointmentsModule,
        PaymentsModule,
        MessagesModule,
        ShiftsModule,
        ReportsModule,
        NotificationsModule,
    ],
})
export class AppModule {}
