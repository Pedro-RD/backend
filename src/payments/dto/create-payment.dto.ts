import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaymentType } from '../enums/payment-type.enum';

export class CreatePaymentDto {
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor deve ser um número' })
    @Min(0, { message: 'O valor deve ser maior ou igual a 0' })
    @IsOptional()
    amount?: number;

    @Type(() => Date)
    @IsDate({ message: 'A data deve ser válida' })
    @IsNotEmpty({ message: 'A data é obrigatória' })
    date: Date;

    @IsEnum(PaymentType, { message: 'O tipo de pagamento é inválido, escolha entre "Mensalidade" e "Outros"' })
    @IsOptional()
    type: PaymentType = PaymentType.MonthlyFee;

    @IsOptional()
    @IsString({ message: 'A observação deve ser uma string' })
    observation?: string;

    @IsOptional()
    @Min(1, { message: 'O mês deve ser maior ou igual a 1' })
    @Max(12, { message: 'O mês deve ser menor ou igual a 12' })
    month?: number;

    @IsOptional()
    @Min(2000, { message: 'O ano deve ser maior ou igual a 2000' })
    year?: number;
}
