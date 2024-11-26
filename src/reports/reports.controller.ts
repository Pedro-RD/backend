import { Controller, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

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
