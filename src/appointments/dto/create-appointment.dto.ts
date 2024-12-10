import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Validate } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateAppointmentDto {
    @IsString({ message: 'O título deve ser uma string.' })
    @MinLength(3, { message: 'O título deve ter pelo menos 3 caracteres.' })
    @IsNotEmpty({ message: 'O título é obrigatório.' })
    title: string;

    @IsDateString({}, { message: 'A data de início deve ser uma data válida.' })
    @IsNotEmpty({ message: 'A data de início é obrigatória.' })
    @Validate(IsFutureDate, { message: 'A data de início deve ser uma data futura.' })
    start: Date;

    @IsString({ message: 'A observação deve ser uma string.' })
    @IsOptional()
    observation: string;

    @IsEnum(AppointmentType, { message: 'O tipo de compromisso deve ser um valor válido.' })
    @IsNotEmpty({ message: 'O tipo de compromisso é obrigatório.' })
    type: AppointmentType;

    @IsEnum(AppointmentStatus, { message: 'O estado do compromisso deve ser um valor válido.' })
    @IsNotEmpty({ message: 'O estado do compromisso é obrigatório.' })
    status: AppointmentStatus;
}
