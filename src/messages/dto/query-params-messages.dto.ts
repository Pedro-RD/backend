import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsMessagesDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'orderBy deve ser uma string' })
    @Matches(/^(id|createdAt)$/, {
        message: 'orderBy deve ser um dos seguintes valores: id, createdAt',
    })
    orderBy?: string;
}
