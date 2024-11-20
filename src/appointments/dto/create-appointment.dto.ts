import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Validate } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateAppointmentDto {
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    title: string;

    @IsDateString()
    @IsNotEmpty()
    @Validate(IsFutureDate)
    start: Date;

    @IsString()
    @IsOptional()
    observation: string;

    @IsEnum(AppointmentType)
    @IsNotEmpty()
    type: AppointmentType;

    @IsEnum(AppointmentStatus)
    @IsNotEmpty()
    status: AppointmentStatus;
}
