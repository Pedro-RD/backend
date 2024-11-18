import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { Role } from '../../enums/roles.enum';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsUsersDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|email|name|phoneNumber|address|postcode|city|fiscalId|nationality)$/)
    orderBy?: string;

    @IsOptional()
    @IsString()
    @IsEnum(Role)
    role?: Role;
}
