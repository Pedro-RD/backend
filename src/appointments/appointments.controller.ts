import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('residents/:residentId/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Param('residentId', ParseIntPipe) residentId: number,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(residentId, createAppointmentDto);
  }

  @Get()
  findAll(@Param('residentId', ParseIntPipe) residentId: number) {
    return this.appointmentsService.findAll(residentId);
  }

  @Get(':id')
  findOne(
    @Param('residentId', ParseIntPipe) residentId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.appointmentsService.findOne(id, residentId);
  }

  @Patch(':id')
  update(
    @Param('residentId', ParseIntPipe) residentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(
      id,
      residentId,
      updateAppointmentDto,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('residentId', ParseIntPipe) residentId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.appointmentsService.remove(id, residentId);
  }
}
