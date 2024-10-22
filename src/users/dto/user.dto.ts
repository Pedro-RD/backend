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
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // Personal information
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
