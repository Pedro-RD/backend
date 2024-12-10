import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CivilStatus } from '../enums/civilStatus.enum';
import { Diet } from '../enums/diet.enum';
import Mobility from '../enums/mobility.enum';

export class CreateResidentDto {
    @IsString({ message: 'O nome deve ser uma string' })
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name: string;

    @IsString({ message: 'O NIF deve ser uma string' })
    @IsNotEmpty({ message: 'O NIF é obrigatório' })
    fiscalId: string;

    @Transform(({ value }) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new BadRequestException(`Formato de data inválido: ${value}`);
        }
        return date;
    })
    @IsNotEmpty({ message: 'A data de nascimento é obrigatória' })
    birthDate: Date;

    @IsOptional()
    @IsString({ message: 'Os cuidados específicos devem ser uma string' })
    specificCare: string;

    @IsEnum(CivilStatus, { message: 'Estado civil inválido' })
    @IsNotEmpty({ message: 'O estado civil é obrigatório' })
    civilStatus: CivilStatus;

    @IsString({ message: 'A nacionalidade deve ser uma string' })
    @IsNotEmpty({ message: 'A nacionalidade é obrigatória' })
    nationality: string;

    @IsEnum(Diet, { message: 'Dieta inválida' })
    @IsNotEmpty({ message: 'A dieta é obrigatória' })
    diet: Diet;

    @IsOptional()
    @IsEnum(Mobility, { message: 'Mobilidade inválida' })
    mobility: Mobility;

    @IsOptional()
    @IsString({ message: 'As restrições alimentares devem ser uma string' })
    dietRestrictions: string;

    @IsOptional()
    @IsString({ message: 'As alergias devem ser uma string' })
    allergies: string;

    @IsNumber({}, { message: 'O número da cama deve ser um número' })
    @IsNotEmpty({ message: 'O número da cama é obrigatório' })
    bedNumber: number;

    @IsOptional()
    @IsArray({ message: 'Os familiares devem ser um array' })
    @IsInt({ each: true, message: 'Os IDs dos familiares devem ser números inteiros' })
    relatives: number[];
}
