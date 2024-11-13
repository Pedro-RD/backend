import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
  @ApiProperty({ 
    minLength: 6, 
    maxLength: 20, 
    example: 'password123',
    description: 'User password'
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
