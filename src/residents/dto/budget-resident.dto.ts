import { IsEnum, IsOptional } from 'class-validator';
import Mobility from '../enums/mobility.enum';

export class BudgetResidentDto {
    @IsOptional()
    @IsEnum(Mobility)
    mobility?: Mobility;
}
