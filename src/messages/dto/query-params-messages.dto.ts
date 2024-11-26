import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsMessagesDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|createdAt)$/)
    orderBy?: string;
}
