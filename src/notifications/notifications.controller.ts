import { Controller, Delete, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/roles.enum';
import { Roles } from '../auth/roles.decorator';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Relative)
    @Get('messages')
    getMessages(@UserReq() userReq: User) {
        return this.notificationsService.getMessages(userReq);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Relative)
    @Delete('messages')
    @HttpCode(HttpStatus.NO_CONTENT)
    cleanMessages(@UserReq() userReq: User) {
        return this.notificationsService.resetMessages(userReq);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Get('shifts')
    getShifts(@UserReq() userReq: User) {
        return this.notificationsService.getShifts(userReq);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete('shifts')
    @HttpCode(HttpStatus.NO_CONTENT)
    cleanShifts(@UserReq() userReq: User) {
        return this.notificationsService.resetShifts(userReq);
    }
}
