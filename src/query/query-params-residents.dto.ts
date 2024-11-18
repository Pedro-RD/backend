import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsResidentsDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|bedNumber|birthDate|name|fiscalId|nationality)$/)
    orderBy?: string;
}
