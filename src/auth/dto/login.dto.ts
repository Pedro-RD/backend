import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  // Login details
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
