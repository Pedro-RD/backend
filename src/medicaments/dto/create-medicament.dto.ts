import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicamentDto {
    @IsString({ message: 'O nome deve ser uma string.' })
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    name: string;

    @IsString({ message: 'As instruções devem ser uma string.' })
    @IsOptional()
    instructions: string;

    @IsNumber({}, { message: 'A quantidade deve ser um número.' })
    @Min(0, { message: 'A quantidade não pode ser negativa.' })
    quantity: number;

    @IsNumber({}, { message: 'A quantidade de prescrição deve ser um número.' })
    @IsOptional()
    @Min(0, { message: 'A quantidade de prescrição não pode ser negativa.' })
    prescriptionQuantity: number;

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty({ message: 'A data de validade é obrigatória.' })
    dueDate: Date;
}
