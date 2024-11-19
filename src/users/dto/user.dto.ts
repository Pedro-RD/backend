import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { Role } from '../../enums/roles.enum';

export class UserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    postcode: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    city: string;

    @IsNotEmpty()
    @MaxLength(20)
    fiscalId: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    nationality: string;

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    residents: number[];
}
