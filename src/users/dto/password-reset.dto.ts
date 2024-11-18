import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDTO {
    @ApiProperty({
        description: 'User password',
        example: 'password',
        minLength: 6,
        maxLength: 20,
        required: true,
    })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string;
}
