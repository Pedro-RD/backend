import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { ShiftType } from '../enums/shift.enum';

export class CreateShiftDto {
    @IsArray({ message: 'Os turnos são obrigatórios' })
    @ArrayMinSize(1, { message: 'Deve haver pelo menos um turno' })
    shifts: ShiftDto[];
}

export class ShiftDto {
    @Type(() => Date)
    @IsDate({ message: 'O dia deve ser uma data válida' })
    @IsNotEmpty({ message: 'O dia é obrigatório' })
    day: Date;

    @IsNotEmpty({ message: 'O turno é obrigatório' })
    @IsEnum(ShiftType, { message: 'O turno é inválido, opções: "Manhã", "Tarde", "Noite", "Férias", "Folga"' })
    shift: ShiftType;
}
