import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthGuardWS implements CanActivate {
    private readonly logger = new Logger(AuthGuardWS.name);
    constructor(
        private jwtService: JwtService,
        private userService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToWs().getClient().handshake;
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logger.error('No token found');
            throw new WsException('Não autorizado');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.userService.findOne(payload.sub);
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request.user = user;
        } catch {
            this.logger.error('Invalid token');
            throw new WsException('Não autorizado');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        Logger.log(JSON.stringify(request.headers));
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
