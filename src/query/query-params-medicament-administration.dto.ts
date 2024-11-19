import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsMedicamentAdministrationDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|hour|dose)$/)
    orderBy?: string;

    @IsOptional()
    @IsInt()
    @Transform(({ value }) => parseInt(value, 10))
    medicamentId?: number;
}
