import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthReportService } from './health-report.service';
import { CreateHealthReportDto } from './dto/create-health-report.dto';
import { UpdateHealthReportDto } from './dto/update-health-report.dto';

@Controller('health-reports')
export class HealthReportController {
  constructor(private readonly healthReportService: HealthReportService) {}

  @Post()
  create(@Body() createHealthReportDto: CreateHealthReportDto) {
    return this.healthReportService.create(createHealthReportDto);
  }

  @Get()
  findAll() {
    return this.healthReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthReportDto: UpdateHealthReportDto) {
    return this.healthReportService.update(+id, updateHealthReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthReportService.remove(+id);
  }
}
