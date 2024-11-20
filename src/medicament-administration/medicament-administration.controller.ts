import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QueryParamsMedicamentAdministrationDto } from '../query/query-params-medicament-administration.dto';
import { CreateMedicamentAdministrationDto } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';
import { MedicamentAdministrationService } from './medicament-administration.service';

@Controller('medicament/:medicamentId/administration')
export class MedicamentAdministrationController {
    constructor(private readonly medicamentAdministrationService: MedicamentAdministrationService) {}

    @Post()
    create(@Param('medicamentId') medicamentId: number, @Body() createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
        return this.medicamentAdministrationService.create(+medicamentId, createMedicamentAdministrationDto);
    }

    @Get()
    findAll(@Param('medicamentId') medicamentId: number, @Query() query: QueryParamsMedicamentAdministrationDto) {
        return this.medicamentAdministrationService.findAll({
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
            medicamentId: +medicamentId,
        });
    }

    @Get(':id')
    findOne(@Param('medicamentId') medicamentId: number, @Param('id') id: string) {
        return this.medicamentAdministrationService.findOne(+medicamentId, +id);
    }

    @Patch(':id')
    update(@Param('medicamentId') medicamentId: number, @Param('id') id: string, @Body() updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto) {
        return this.medicamentAdministrationService.update(+medicamentId, +id, updateMedicamentAdministrationDto);
    }

    @Delete(':id')
    remove(@Param('medicamentId') medicamentId: number, @Param('id') id: string) {
        return this.medicamentAdministrationService.remove(+medicamentId, +id);
    }
}
