import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { QueryParamsDto } from '../../query/query-params.dto';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class QueryParamsAppointmentDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'orderBy deve ser uma string' })
    @Matches(/^(id|start|title|status|type)$/, { message: 'orderBy deve ser um dos seguintes valores: id, start, title, status, type' })
    orderBy?: string;

    @IsOptional()
    @IsEnum(AppointmentStatus, { message: 'status deve ser um valor válido de AppointmentStatus' })
    status?: AppointmentStatus;

    @IsOptional()
    @IsEnum(AppointmentType, { message: 'type deve ser um valor válido de AppointmentType' })
    type?: AppointmentType;
}
