import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
    @IsNotEmpty({ message: 'O conteúdo é obrigatório.' })
    @IsString({ message: 'O conteúdo deve ser uma string.' })
    content: string;
}
