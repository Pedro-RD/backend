import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEvent]), UsersModule, AuthModule],
    providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
