import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QueryParamsMedicamentsDto } from '../query/query-params-medicaments.dto';
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { MedicamentsService } from './medicaments.service';

@Controller('residents/:residentId/medicaments')
export class MedicamentsController {
    constructor(private readonly medicamentsService: MedicamentsService) {}

    @Post()
    create(@Param('residentId') residentId: string, @Body() createMedicamentDto: CreateMedicamentDto) {
        return this.medicamentsService.create(+residentId, createMedicamentDto);
    }

    @Get()
    findAll(@Query() query: QueryParamsMedicamentsDto, @Param('residentId') residentId: string) {
        return this.medicamentsService.findAll(+residentId, {
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Param('residentId') residentId: string) {
        return this.medicamentsService.findOne(+residentId, +id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMedicamentDto: UpdateMedicamentDto, @Param('residentId') residentId: string) {
        return this.medicamentsService.update(+residentId, +id, updateMedicamentDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Param('residentId') residentId: string) {
        return this.medicamentsService.remove(+residentId, +id);
    }
}
