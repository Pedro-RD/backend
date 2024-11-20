import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { QueryParamsDto } from '../../query/query-params.dto';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class QueryParamsAppointmentDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|start|title|status|type)$/)
    orderBy?: string;

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @IsOptional()
    @IsEnum(AppointmentType)
    type?: AppointmentType;
}
