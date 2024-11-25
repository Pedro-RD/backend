import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateHealthReportDto } from './dto/create-health-report.dto';
import { QueryParamsHealthReportDto } from './dto/query-params-health-report.dto';
import { UpdateHealthReportDto } from './dto/update-health-report.dto';
import { HealthReportService } from './health-report.service';

@Controller('residents/:residentId/health-reports')
export class HealthReportController {
    logger = new Logger('HealthReportController');
    constructor(private readonly healthReportService: HealthReportService) {}

    @Post()
    create(@Body() createHealthReportDto: CreateHealthReportDto, @Param('residentId', ParseIntPipe) residentId: number) {
        this.logger.log(`Mehod: POST, Resident ID: ${residentId}, Data: ${JSON.stringify(createHealthReportDto)}`);
        return this.healthReportService.create(residentId, createHealthReportDto);
    }

    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId: number, @Query() queryParams: QueryParamsHealthReportDto) {
        this.logger.log(`Method: GET, Resident ID: ${residentId}, Query Params: ${JSON.stringify(queryParams)}`);
        return this.healthReportService.findAll(residentId, queryParams);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Param('residentId', ParseIntPipe) residentId: number) {
        this.logger.log(`Method: GET, Resident ID: ${residentId}, Health Report ID: ${id}`);
        return this.healthReportService.findOne(residentId, id);
    }

    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number, @Body() updateHealthReportDto: UpdateHealthReportDto) {
        this.logger.log(`Method: PATCH, Resident ID: ${residentId}, Health Report ID: ${id}, Data: ${JSON.stringify(updateHealthReportDto)}`);
        return this.healthReportService.update(residentId, id, updateHealthReportDto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number) {
        this.logger.log(`Method: DELETE, Resident ID: ${residentId}, Health Report ID: ${id}`);
        return this.healthReportService.remove(residentId, id);
    }
}
