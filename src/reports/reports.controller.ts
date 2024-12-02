import { Controller, Get, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/roles.enum';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Get('')
    async exportExcel(@Query('year', ParseIntPipe) year: number, @Query('month', ParseIntPipe) month: number, @Res() res: Response) {
        if (!year || !month) {
            return res.status(400).send('Year and month are required');
        }

        const buffer = await this.reportsService.exportExcel(year, month);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
        res.send(buffer);
    }
}
