import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/roles.enum';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('dashboards')
export class DashboardsController {
    constructor(private readonly dashboardsService: DashboardsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Get('manager')
    public async getManagerDashboardData() {
        return this.dashboardsService.getManagerDashboardData();
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Caretaker)
    @Get('caretaker')
    public async getCaretakerDashboardData() {
        return this.dashboardsService.getCaretakerDashboardData();
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Relative)
    @Get('relative')
    public async getRelativeDashboardData(@UserReq('id') user: User) {
        return await this.dashboardsService.getRelativeDashboardData(user.id);
    }
}
