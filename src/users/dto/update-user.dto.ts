import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class UpdateUserDto extends PartialType(UserDto) {
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
