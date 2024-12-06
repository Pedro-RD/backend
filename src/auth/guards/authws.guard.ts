import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthGuardWS implements CanActivate {
    private readonly logger = new Logger(AuthGuardWS.name);
    constructor(
        private jwtService: JwtService,
        private userService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = this.extractTokenFromHeader(context.switchToWs().getClient());
        if (!token) {
            this.logger.error('No token found');
            throw new WsException('Não autorizado');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.userService.findOne(payload.sub);
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            context.switchToWs().getClient().handshake.user = user;
        } catch (error) {
            this.logger.error(`Error: ${JSON.stringify(error)} Message: ${error.message}`);
            throw new WsException('Não autorizado');
        }
        return true;
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        Logger.log(JSON.stringify(client.handshake.auth));
        const [type, token] = client.handshake.auth?.authorization.split(' ') || [];
        return type === 'Bearer' ? token : undefined;
    }

    static validateToken(client: Socket) {
        const authorization = client.handshake.auth?.authorization;

        if (!authorization) {
            Logger.error('No token found');
            throw new WsException('Não autorizado');
        }
        const [type, token] = authorization.split(' ');
        if (type !== 'Bearer') {
            Logger.error('Invalid token type');
            throw new WsException('Não autorizado');
        }

        return verify(token, process.env.JWT_SECRET);
    }
}
