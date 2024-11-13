import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicamentDto } from './create-medicament.dto';
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateMedicamentDto extends PartialType(CreateMedicamentDto) {
  @IsNumber()
  @IsNotEmpty()
  medicament: number;
}
