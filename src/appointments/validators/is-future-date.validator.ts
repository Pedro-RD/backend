import { Logger } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
    validate(date: Date, args: ValidationArguments) {
        Logger.error(args);
        const currentDate = new Date();
        return new Date(date).getTime() > currentDate.getTime();
    }

    defaultMessage(args: ValidationArguments) {
        Logger.error(args);
        return 'A data deve ser uma data futura';
    }
}
