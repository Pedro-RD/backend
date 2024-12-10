import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
    @IsNotEmpty({ message: 'A palavra-passe é obrigatória' })
    @MinLength(6, { message: 'A palavra-passe deve ter no mínimo 6 caracteres' })
    @MaxLength(20, { message: 'A palavra-passe deve ter no máximo 20 caracteres' })
    password: string;
}
