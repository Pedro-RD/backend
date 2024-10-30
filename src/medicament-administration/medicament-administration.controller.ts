import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicamentAdministrationService } from './medicament-administration.service';
import { CreateMedicamentAdministrationDto } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';

@Controller('medicament-administrations')
export class MedicamentAdministrationController {
  constructor(private readonly medicamentAdministrationService: MedicamentAdministrationService) {}

  @Post()
  create(@Body() createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
    return this.medicamentAdministrationService.create(createMedicamentAdministrationDto);
  }

  @Get()
  findAll() {
    return this.medicamentAdministrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicamentAdministrationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto) {
    return this.medicamentAdministrationService.update(+id, updateMedicamentAdministrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicamentAdministrationService.remove(+id);
  }
}
