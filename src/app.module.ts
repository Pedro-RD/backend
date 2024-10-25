import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ResidentsModule } from './residents/residents.module';
  import { Resident } from "./residents/entities/resident.entity";
import { HealthReportModule } from './health-report/health-report.module';
import { HealthReport } from "./health-report/entities/health-report.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Resident, HealthReport],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ResidentsModule,
    HealthReportModule,
  ],
})
export class AppModule {}
