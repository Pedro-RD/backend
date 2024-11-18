import { IsArray, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enums/roles.enum';

export class UserDto {
    @ApiProperty({
        description: 'User email',
        example: 'test@test.com',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User name',
        example: 'John Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @ApiProperty({
        description: 'User phone number',
        example: '+34600123456',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phoneNumber: string;

    @ApiProperty({
        description: 'User address',
        example: 'Calle de la piruleta 3',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address: string;

    @ApiProperty({
        description: 'User postcode',
        example: '28001',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    postcode: string;

    @ApiProperty({
        description: 'User city',
        example: 'Madrid',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    city: string;

    @ApiProperty({
        description: 'User fiscal id',
        example: '12345678Z',
        required: true,
    })
    @IsNotEmpty()
    @MaxLength(20)
    fiscalId: string;

    @ApiProperty({
        description: 'User Nationality',
        example: 'Spanish',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    nationality: string;

    @ApiProperty({
        description: 'User role',
        example: 'manager',
        required: true,
        enum: Role,
    })
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @ApiProperty({
        description: 'User residents',
        example: [1, 2],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    residents: number[];
}
