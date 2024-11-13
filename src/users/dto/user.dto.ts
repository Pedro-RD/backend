import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';

import { Role } from '../../auth/enums/roles.enum';

export class UserDto {
  // Login details
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // Personal information
  @ApiProperty({ example: 'John Doe', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '+351123456789', pattern: '^\+?[1-9]\d{1,14}$' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  address: string;

  @ApiProperty({ example: '1234-567', maxLength: 10 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  postcode: string;

  @ApiProperty({ example: 'Lisbon', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  city: string;

  @ApiProperty({ example: '123456789', maxLength: 20 })
  @IsNotEmpty()
  @MaxLength(20)
  fiscalId: string;

  @ApiProperty({ example: 'Portuguese', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nationality: string;

  @ApiProperty({ enum: Role, example: Role.User })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ type: [Number], required: false, example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  residents: number[];
}
