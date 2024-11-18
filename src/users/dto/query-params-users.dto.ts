import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enums/roles.enum';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsUsersDto extends QueryParamsDto {
    @ApiProperty({
        description: 'Order by field',
        example: 'id',
        required: false,
        enum: ['id', 'email', 'name', 'phoneNumber', 'address', 'postcode', 'city', 'fiscalId', 'nationality'],
    })
    @IsOptional()
    @IsString()
    @Matches(/^(id|email|name|phoneNumber|address|postcode|city|fiscalId|nationality)$/)
    orderBy?: string;

    @ApiProperty({
        description: 'Role of the user',
        required: false,
        enum: Role,
    })
    @IsOptional()
    @IsString()
    @IsEnum(Role)
    role?: Role;
}
