import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicamentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    instructions: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    prescriptionQuantity: number;

    @Transform(({ value }) => new Date(value))
    @IsNotEmpty()
    dueDate: Date;
}
