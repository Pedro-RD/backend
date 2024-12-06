import { Socket } from 'socket.io';
import { AuthGuardWS } from './authws.guard';
import { Logger } from '@nestjs/common';
type SocketIoMiddleware = {
    (client: Socket, next: (err?: Error) => void): void;
};

export const SocketAuthMiddleware = (): SocketIoMiddleware => (client, next) => {
    try {
        Logger.log('SocketAuthMiddleware');
        const payload = AuthGuardWS.validateToken(client);
        client.handshake['user'] = payload;

        next();
    } catch (error) {
        next(error);
    }
};
