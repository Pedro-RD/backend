import { Logger } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    Min,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isContractEndAfterStart', async: false })
class IsContractEndAfterStartConstraint implements ValidatorConstraintInterface {
    validate(contractEnds: Date, args: ValidationArguments): boolean {
        const object = args.object as any;
        const contractStart = object.contractStart;

        return !contractEnds || contractEnds > contractStart;
    }

    defaultMessage(args: ValidationArguments): string {
        Logger.error(args);
        return 'A data de fim do contrato deve ser posterior à data de início';
    }
}

export class CreateEmployeeDto {
    @IsNotEmpty({ message: 'O salário é obrigatório' })
    @IsPositive({ message: 'O salário deve ser um valor positivo' })
    @Min(820, { message: 'O salário mínimo é 820' })
    salary: number;

    @IsNotEmpty({ message: 'A data de início do contrato é obrigatória' })
    @Type(() => Date)
    @IsDate({ message: 'A data de início do contrato deve ser uma data válida' })
    contractStart: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'A data de fim do contrato deve ser uma data válida' })
    @Validate(IsContractEndAfterStartConstraint, { message: 'A data de fim do contrato deve ser posterior à data de início' })
    contractEnds: Date;

    @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
    @IsInt({ message: 'O ID do usuário deve ser um número inteiro' })
    userId: number;
}
