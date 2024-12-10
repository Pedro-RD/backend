import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { Role } from '../../enums/roles.enum';

export class UserDto {
    @IsNotEmpty({ message: 'O email é obrigatório' })
    @IsEmail({}, { message: 'O email fornecido não é válido' })
    email: string;

    @IsNotEmpty({ message: 'O nome é obrigatório' })
    @IsString({ message: 'O nome deve ser texto' })
    @MaxLength(50, { message: 'O nome não pode exceder 50 caracteres' })
    name: string;

    @IsNotEmpty({ message: 'O número de telefone é obrigatório' })
    @IsString({ message: 'O número de telefone deve ser texto' })
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'O número de telefone não é válido' })
    phoneNumber: string;

    @IsNotEmpty({ message: 'A morada é obrigatória' })
    @IsString({ message: 'A morada deve ser texto' })
    @MaxLength(100, { message: 'A morada não pode exceder 100 caracteres' })
    address: string;

    @IsNotEmpty({ message: 'O código postal é obrigatório' })
    @IsString({ message: 'O código postal deve ser texto' })
    @MaxLength(10, { message: 'O código postal não pode exceder 10 caracteres' })
    postcode: string;

    @IsNotEmpty({ message: 'A cidade é obrigatória' })
    @IsString({ message: 'A cidade deve ser texto' })
    @MaxLength(50, { message: 'A cidade não pode exceder 50 caracteres' })
    city: string;

    @IsNotEmpty({ message: 'O NIF é obrigatório' })
    @MaxLength(20, { message: 'O NIF não pode exceder 20 caracteres' })
    fiscalId: string;

    @IsNotEmpty({ message: 'A nacionalidade é obrigatória' })
    @IsString({ message: 'A nacionalidade deve ser texto' })
    @MaxLength(50, { message: 'A nacionalidade não pode exceder 50 caracteres' })
    nationality: string;

    @IsNotEmpty({ message: 'O cargo é obrigatório' })
    @IsEnum(Role, { message: 'O cargo fornecido não é válido' })
    role: Role;

    @IsOptional()
    @IsArray({ message: 'Os residentes devem ser uma lista' })
    @IsInt({ each: true, message: 'Cada residente deve ser um número inteiro' })
    residents: number[];
}
