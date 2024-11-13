import { IsDateString, IsString, IsEnum, IsInt, IsNotEmpty, MinLength } from 'class-validator';
import { AppointmentType, AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  start: Date;

  @IsString()
  observation: string;

  @IsEnum(AppointmentType)
  @IsNotEmpty()
  type: AppointmentType;

  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @IsInt()
  @IsNotEmpty()
  residentId: number;
}
