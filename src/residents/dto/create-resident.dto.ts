import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CivilStatus } from '../enums/civilStatus.enum';
import { Diet } from '../enums/diet.enum';

export class CreateResidentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    fiscalId: string;

    @Transform(({ value }) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new BadRequestException(`Invalid date format: ${value}`);
        }
        return date;
    })
    @IsNotEmpty()
    birthDate: Date;

    @IsOptional()
    @IsString()
    specificCare: string;

    @IsEnum(CivilStatus)
    @IsNotEmpty()
    civilStatus: CivilStatus;

    @IsString()
    @IsNotEmpty()
    nationality: string;

    @IsEnum(Diet)
    @IsNotEmpty()
    diet: Diet;

    @IsOptional()
    @IsString()
    dietRestrictions: string;

    @IsOptional()
    @IsString()
    allergies: string;

    @IsNumber()
    @IsNotEmpty()
    bedNumber: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    relatives: number[];
}
