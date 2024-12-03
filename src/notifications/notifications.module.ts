import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEvent } from './entities/notification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEvent])],
    providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
