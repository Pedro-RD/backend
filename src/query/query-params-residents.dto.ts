import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsResidentsDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'O campo de ordenação deve ser uma string' })
    @Matches(/^(id|bedNumber|birthDate|name|fiscalId|nationality)$/, {
        message: 'O campo de ordenação deve ser um dos seguintes valores: id, bedNumber, birthDate, name, fiscalId, nationality',
    })
    orderBy?: string;
}
