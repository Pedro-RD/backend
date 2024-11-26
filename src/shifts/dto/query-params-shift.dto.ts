import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class QueryParamsShiftDto {
    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'A data de início deve ser uma data válida' })
    from: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'A data de fim deve ser uma data válida' })
    to: Date;
}
