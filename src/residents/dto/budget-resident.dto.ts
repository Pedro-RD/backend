import { IsEnum, IsOptional } from 'class-validator';
import Mobility from '../enums/mobility.enum';

export class BudgetResidentDto {
    @IsOptional()
    @IsEnum(Mobility, {
        message: 'O tipo de mobilidade fornecido não é válido',
    })
    mobility?: Mobility;
}
