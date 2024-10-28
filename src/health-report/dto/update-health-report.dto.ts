import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthReportDto } from './create-health-report.dto';

export class UpdateHealthReportDto extends PartialType(CreateHealthReportDto) {}
