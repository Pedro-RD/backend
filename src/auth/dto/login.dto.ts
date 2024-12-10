import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    // Login details
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
    email: string;

    @IsNotEmpty({ message: 'A palavra-passe é obrigatória.' })
    password: string;
}
