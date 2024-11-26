import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsEmployeeDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|salary|contractEnds|contractStart|createdAt)$/)
    orderBy?: string;
}
