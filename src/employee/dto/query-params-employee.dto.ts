import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsEmployeeDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'orderBy deve ser uma string' })
    @Matches(/^(id|salary|contractEnds|contractStart|createdAt)$/, {
        message: 'orderBy deve ser um dos seguintes valores: id, salary, contractEnds, contractStart, createdAt',
    })
    orderBy?: string;
}
