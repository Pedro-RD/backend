import { IsNotEmpty, IsNumber, IsString, Matches, Max, Min } from 'class-validator';

export class CreateHealthReportDto {
    @IsNotEmpty({ message: 'A pressão arterial é obrigatória.' })
    @IsString({ message: 'A pressão arterial deve ser uma string.' })
    @Matches(/^\d{1,3}[\/Xx]\d{1,3}$/, { message: 'A pressão arterial deve estar no formato correto.' })
    arterialBloodPressure: string;

    @IsNumber({}, { message: 'A temperatura deve ser um número.' })
    @Min(25, { message: 'A temperatura mínima é 25 graus Celsius.' })
    @Max(50, { message: 'A temperatura máxima é 50 graus Celsius.' })
    temperature: number; // graus Celsius

    @IsNumber({}, { message: 'A altura deve ser um número.' })
    @Min(0.4, { message: 'A altura mínima é 0.4 metros.' })
    @Max(2.5, { message: 'A altura máxima é 2.5 metros.' })
    height: number; // metro

    @IsNumber({}, { message: 'O peso deve ser um número.' })
    @Min(2, { message: 'O peso mínimo é 2 quilos.' })
    @Max(300, { message: 'O peso máximo é 300 quilos.' })
    weight: number; // quilo

    @IsNumber({}, { message: 'A frequência respiratória deve ser um número.' })
    @Min(0, { message: 'A frequência respiratória mínima é 0 ciclos por minuto.' })
    @Max(60, { message: 'A frequência respiratória máxima é 60 ciclos por minuto.' })
    respiratoryRate: number; // Frequência Respiratória (ciclos respiratórios por min)

    @IsNumber({}, { message: 'A frequência cardíaca deve ser um número.' })
    @Min(0, { message: 'A frequência cardíaca mínima é 0 batimentos por minuto.' })
    @Max(300, { message: 'A frequência cardíaca máxima é 300 batimentos por minuto.' })
    heartRate: number; // Frequência Cardíaca (batimentos por min)

    @IsNumber({}, { message: 'O nível de glicemia deve ser um número.' })
    @Min(40, { message: 'O nível de glicemia mínimo é 40.' })
    @Max(500, { message: 'O nível de glicemia máximo é 500.' })
    bloodGlucoseLevel: number; // Nível de Glicemia

    @IsString({ message: 'A mobilidade deve ser uma string.' })
    @IsNotEmpty({ message: 'A mobilidade é obrigatória.' })
    mobility: string;

    @IsString({ message: 'O nível de hidratação deve ser uma string.' })
    @IsNotEmpty({ message: 'O nível de hidratação é obrigatório.' })
    hydrationLevel: string;

    @IsString({ message: 'A avaliação cognitiva e emocional deve ser uma string.' })
    @IsNotEmpty({ message: 'A avaliação cognitiva e emocional é obrigatória.' })
    cognitiveEmotionalAssessment: string; // Avaliação Cognitiva e Emocional

    @IsNumber({}, { message: 'A taxa de oxigênio no sangue deve ser um número.' })
    @Min(0, { message: 'A taxa de oxigênio no sangue mínima é 0%.' })
    @Max(100, { message: 'A taxa de oxigênio no sangue máxima é 100%.' })
    bloodOxygenLevel: number; // Taxa de Oxigênio no Sangue (%)
}
