import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class CreateHealthReportDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{1,3}[\/Xx]\d{1,3}$/)
  arterialBloodPressure: string;

  @IsNumber()
  @Min(25)
  @Max(50)
  temperature: number; //graus celsius

  @IsNumber()
  @Min(0.4)
  @Max(2.5)
  height: number; //metro

  @IsNumber()
  @Min(2)
  @Max(300)
  weight: number; //quilo

  @IsNumber()
  @Min(0)
  @Max(60)
  respiratoryRate: number; // Frequência Respiratória (ciclos respiratórios por min)

  @IsNumber()
  @Min(0)
  @Max(300)
  heartRate: number; // Frequência Cardíaca (batimentos por min)

  @IsNumber()
  @Min(40)
  @Max(500)
  bloodGlucoseLevel: number; // Nível de Glicemia

  @IsString()
  @IsNotEmpty()
  mobility: string;

  @IsString()
  @IsNotEmpty()
  hydrationLevel: string;

  @IsString()
  @IsNotEmpty()
  cognitiveEmotionalAssessment: string; // Avaliação Cognitiva e Emocional

  @IsNumber()
  @Min(0)
  @Max(100)
  bloodOxygenLevel: number; // Taxa de Oxigênio no Sangue (%)

  @IsNumber()
  @IsNotEmpty()
  resident: number;
}
