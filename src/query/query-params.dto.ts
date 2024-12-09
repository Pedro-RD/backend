import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryParamsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'O campo página deve ser um número inteiro' })
    @Min(1, { message: 'A página deve ser maior que 0' })
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'O limite deve ser um número inteiro' })
    @Min(1, { message: 'O limite deve ser maior que 0' })
    limit?: number;

    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'A ordenação deve ser ASC ou DESC' })
    order?: 'ASC' | 'DESC';

    @IsOptional()
    @IsString({ message: 'O termo de pesquisa deve ser uma string' })
    search?: string;
}
