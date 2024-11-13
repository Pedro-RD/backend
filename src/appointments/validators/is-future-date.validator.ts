import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    const currentDate = new Date();
    return new Date(date).getTime() > currentDate.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return 'The start date must be in the future';
  }
}