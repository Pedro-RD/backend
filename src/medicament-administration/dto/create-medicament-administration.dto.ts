import { IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class CreateMedicamentAdministrationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0|1[0-9]|2[0-3]|([01]?[0-9]))[:][0-5][0-9]$/)
  hour: string;

  @IsNumber()
  dose: number;

  //@IsNumber()
  //@IsNotEmpty()
  //medicament: number;
}
