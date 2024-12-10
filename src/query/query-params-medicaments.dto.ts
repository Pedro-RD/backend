import { IsOptional, IsString, Matches } from 'class-validator';
import { QueryParamsDto } from './query-params.dto';

export class QueryParamsMedicamentsDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'O campo de ordenação deve ser uma string' })
    @Matches(/^(id|name|instructions|quantity|prescriptionQuantity|dueDate)$/, {
        message: 'O campo de ordenação deve ser um dos seguintes valores: id, name, instructions, quantity, prescriptionQuantity, dueDate',
    })
    orderBy?: string;
}
