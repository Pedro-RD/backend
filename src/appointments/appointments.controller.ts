import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryParamsAppointmentDto } from './dto/query-params-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('residents/:residentId/appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post()
    create(@Param('residentId', ParseIntPipe) residentId: number, @Body() createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentsService.create(residentId, createAppointmentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId: number, @Query() queryParams: QueryParamsAppointmentDto, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get(':id')
    findOne(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        return this.appointmentsService.findOne(id, residentId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return this.appointmentsService.update(id, residentId, updateAppointmentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number) {
        await this.appointmentsService.remove(id, residentId);
    }
}
