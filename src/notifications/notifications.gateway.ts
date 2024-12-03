import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { Server } from 'socket.io';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { NotificationEvent, NotificationStatus } from './entities/notification.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuardWS } from '../auth/guards/rolesws.guard';
import { AuthGuardWS } from '../auth/guards/authws.guard';
import { Role } from '../enums/roles.enum';

interface WebSocketEvents {
    loadNotifications: (payload: NotificationEvent[]) => void;
}

@WebSocketGateway()
export class NotificationsGateway implements OnModuleInit {
    constructor(private readonly notificationsService: NotificationsService) {}

    @WebSocketServer()
    server: Server<any, WebSocketEvents>;

    onModuleInit() {
        this.notificationsService.loadNotifications();
        this.notificationsService.internalNotifications$.subscribe((notifications) => {
            this.server.emit('loadNotifications', notifications);
        });

        // when a new connection is made send the notifications
        this.server.on('connection', () => {
            this.server.emit('loadNotifications', this.notificationsService.internalNotifications);
        });
    }

    @UseGuards(AuthGuardWS, RolesGuardWS)
    @Roles(Role.Manager, Role.Caretaker)
    @SubscribeMessage('updateStatus')
    updateStatus(@MessageBody() data: { id: number; status: NotificationStatus }) {
        return this.notificationsService.updateStatus(data.id, data.status);
    }
}
