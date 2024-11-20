import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsMedicamentsDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|name|instructions|quantity|prescriptionQuantity)$/)
    orderBy?: string;
}
