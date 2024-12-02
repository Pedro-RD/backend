import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Shift } from './entities/shift.entity';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Shift, Employee]), UsersModule, AuthModule],
    controllers: [ShiftsController],
    providers: [ShiftsService],
})
export class ShiftsModule {}
