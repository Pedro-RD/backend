import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { Role } from '../../enums/roles.enum';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsUsersDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'O campo de ordenação deve ser uma string' })
    @Matches(/^(id|email|name|phoneNumber|address|postcode|city|fiscalId|role|nationality)$/, {
        message: 'Campo de ordenação inválido. Deve ser um dos seguintes: id, email, name, phoneNumber, address, postcode, city, fiscalId, role, nationality',
    })
    orderBy?: string;

    @IsOptional()
    @IsString({ message: 'O cargo deve ser uma string' })
    @IsEnum(Role, { message: 'Cargo inválido' })
    role?: Role;
}
