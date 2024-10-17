import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
