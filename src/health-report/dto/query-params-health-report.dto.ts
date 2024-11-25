import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, ValidateIf } from 'class-validator';
import { QueryParamsDto } from '../../query/query-params.dto';

export class QueryParamsHealthReportDto extends QueryParamsDto {
    @IsOptional()
    @IsString({ message: 'O campo orderBy deve ser uma string.' })
    @Matches(/^(id|arterialBloodPressure|temperature|height|weight|respiratoryRate|heartRate|bloodGlucoseLevel|hydrationLevel|bloodOxygenLevel|createdAt)$/, {
        message:
            'O campo orderBy deve corresponder a um dos valores permitidos: id, arterialBloodPressure, temperature, height, weight, respiratoryRate, heartRate, bloodGlucoseLevel, hydrationLevel, bloodOxygenLevel, createdAt.',
    })
    orderBy?: string;

    @IsOptional()
    @ValidateIf((obj, value) => !isNaN(Date.parse(value)), { message: 'O campo from deve ser uma data válida.' })
    @Transform(({ value }) => new Date(value))
    from?: Date;

    @IsOptional()
    @ValidateIf((obj, value) => !isNaN(Date.parse(value)), { message: 'O campo to deve ser uma data válida.' })
    @Transform(({ value }) => new Date(value))
    to?: Date;
}
