import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { NotificationsService } from './notifications.service';
import { Server } from 'socket.io';
import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { NotificationEvent, NotificationStatus } from './entities/notification.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuardWS } from '../auth/guards/rolesws.guard';
import { AuthGuardWS } from '../auth/guards/authws.guard';
import { Role } from '../enums/roles.enum';
import { Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../auth/guards/ws.miidleware';
import { UserWS } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

interface WebSocketEvents {
    loadNotifications: (payload: NotificationEvent[]) => void;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnModuleInit, OnGatewayInit {
    logger = new Logger(NotificationsGateway.name);
    constructor(private readonly notificationsService: NotificationsService) {}

    afterInit(server: Socket) {
        this.logger.log('Websocket server started');
        server.use(SocketAuthMiddleware() as any);
    }

    @WebSocketServer()
    server: Server<any, WebSocketEvents>;

    onModuleInit() {
        this.logger.log('Websocket server started');
        this.notificationsService.loadNotifications();
        this.notificationsService.internalNotifications$.subscribe((notifications) => {
            this.logger.log('Sending notifications to all clients');
            this.server.emit('loadNotifications', notifications);
        });

        // when a new connection is made send the notifications
        this.server.on('connection', () => {
            this.logger.log('New connection, sending notifications');
            this.server.emit('loadNotifications', this.notificationsService.internalNotifications);
        });
    }

    @UseGuards(AuthGuardWS, RolesGuardWS)
    @Roles(Role.Manager, Role.Caretaker)
    @SubscribeMessage('updateStatus')
    updateStatus(@MessageBody() data: { id: number; status: NotificationStatus }, @UserWS() user: User) {
        this.logger.log(`Update status for notification ${data.id} to ${data.status} by ${JSON.stringify(user)}`);
        return this.notificationsService.updateStatus(data.id, data.status, user.id);
    }
}
