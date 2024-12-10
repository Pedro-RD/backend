import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';
import { PaymentType } from '../enums/payment-type.enum';

export class QueryParamsPaymentsDto extends QueryParamsDto {
    @IsOptional()
    @IsString()
    @Matches(/^(id|amount|date|type|observation|month|year)$/, {
        message: 'orderBy deve ser um dos seguintes valores: id, amount, date, type, observation, month, year',
    })
    orderBy?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'from deve ser uma data válida' })
    from?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'to deve ser uma data válida' })
    to?: Date;

    @IsOptional()
    @IsEnum(PaymentType)
    type?: PaymentType;
}
