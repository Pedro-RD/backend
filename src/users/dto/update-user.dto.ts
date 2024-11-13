import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class UpdateUserDto extends PartialType(UserDto) {
  @ApiProperty({ 
    minLength: 6, 
    maxLength: 20, 
    required: false,
    example: 'newpassword123',
    description: 'New password (optional)'
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
