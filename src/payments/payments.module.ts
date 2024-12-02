import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { ResidentsModule } from '../residents/residents.module';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Resident]), ResidentsModule, UsersModule, AuthModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}
