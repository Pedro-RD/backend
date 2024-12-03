import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/roles.enum';
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuardWS implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        Logger.log(`Checking roles...`);
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles) {
            return true;
        }
        Logger.log(`Required roles: ${requiredRoles.join(', ')}`);
        const client = context.switchToWs().getClient();
        Logger.log(`Client handshake: ${JSON.stringify(client.handshake)}`);
        Logger.log(`Client handshake user: ${JSON.stringify(client.handshake.user)}`);

        const user = client.handshake.user;
        const result = requiredRoles.some((role) => user?.role === role);
        Logger.log(`User ${user?.email} has role ${user?.role}. Required roles: ${requiredRoles.join(', ')}. Result: ${result}`);
        return result;
    }
}
