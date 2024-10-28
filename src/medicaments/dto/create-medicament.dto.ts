import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CreateMedicamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  prescriptionQuantity: number;

  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  dueDate: Date;

  @IsNumber()
  resident: number;
}
