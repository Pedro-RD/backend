import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicamentAdministrationDto } from './create-medicament-administration.dto';

export class UpdateMedicamentAdministrationDto extends PartialType(CreateMedicamentAdministrationDto) {}
