import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryParamsAppointmentDto } from './dto/query-params-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('residents/:residentId/appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Post()
    create(@Param('residentId', ParseIntPipe) residentId: number, @Body() createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentsService.create(residentId, createAppointmentDto);
    }

    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId: number, @Query() queryParams: QueryParamsAppointmentDto) {
        console.log('queryParams', queryParams);
        return this.appointmentsService.findAll(residentId, {
            page: queryParams.page || 1,
            limit: queryParams.limit || 10,
            orderBy: queryParams.orderBy || 'id',
            order: queryParams.order || 'ASC',
            status: queryParams.status,
            type: queryParams.type,
            search: queryParams.search,
        });
    }

    @Get(':id')
    findOne(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number) {
        return this.appointmentsService.findOne(id, residentId);
    }

    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return this.appointmentsService.update(id, residentId, updateAppointmentDto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number) {
        await this.appointmentsService.remove(id, residentId);
    }
}
