import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint, ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: 'isContractEndAfterStart', async: false })
class IsContractEndAfterStartConstraint implements ValidatorConstraintInterface {
  validate(contractEnds: Date, args: ValidationArguments): boolean {
    const object = args.object as any;
    const contractStart = object.contractStart;

    return !contractEnds || contractEnds > contractStart;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'contractEnds must be after contractStart';
  }
}

export class CreateEmployeeDto{
  @IsNotEmpty()
  @IsPositive()
  @Min(820)
  salary: number;

  @IsNotEmpty()
  contractStart: Date;

  @IsOptional()
  @Validate(IsContractEndAfterStartConstraint)
  contractEnds: Date;

  @IsNotEmpty()
  @IsInt()
  user: number;
}

