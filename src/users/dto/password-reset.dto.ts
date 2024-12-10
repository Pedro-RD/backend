import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDTO {
    @IsNotEmpty({ message: 'A palavra-passe é obrigatória' })
    @MinLength(6, { message: 'A palavra-passe deve ter no mínimo 6 caracteres' })
    @MaxLength(20, { message: 'A palavra-passe não pode ter mais de 20 caracteres' })
    password: string;
}
