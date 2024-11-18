import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
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
