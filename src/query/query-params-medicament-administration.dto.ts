import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsMedicamentAdministrationDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'O campo de ordenação deve ser uma string' })
    @Matches(/^(id|hour|dose)$/, {
        message: 'O campo de ordenação deve ser "id", "hour" ou "dose"',
    })
    orderBy?: string;

    @IsOptional()
    @IsInt({ message: 'O ID do medicamento deve ser um número inteiro' })
    @Transform(({ value }) => parseInt(value, 10))
    medicamentId?: number;
}
