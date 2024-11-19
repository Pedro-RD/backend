import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDTO {
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;
}
