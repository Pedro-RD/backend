import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';
import { MedicamentAdministration } from '../medicament-administration/entities/medicament-administration.entity';
import { Medicament } from '../medicaments/entities/medicament.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEvent, User, MedicamentAdministration, Medicament]), UsersModule, AuthModule],
    providers: [NotificationsGateway, NotificationsService],
    controllers: [NotificationsController],
})
export class NotificationsModule {}
