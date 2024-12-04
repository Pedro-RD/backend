import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { QueryParamsMedicamentAdministrationDto } from '../query/query-params-medicament-administration.dto';
import { CreateMedicamentAdministrationDto, MedicamentAdministrationDTO } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';
import { MedicamentAdministrationService } from './medicament-administration.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('medicament/:medicamentId/administration')
export class MedicamentAdministrationController {
    constructor(private readonly medicamentAdministrationService: MedicamentAdministrationService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post()
    create(@Param('medicamentId') medicamentId: number, @Body() createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
        return this.medicamentAdministrationService.create(+medicamentId, new MedicamentAdministrationDTO(createMedicamentAdministrationDto));
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Get(':id')
    findOne(@Param('medicamentId') medicamentId: number, @Param('id') id: string) {
        return this.medicamentAdministrationService.findOne(+medicamentId, +id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Patch(':id')
    update(@Param('medicamentId') medicamentId: number, @Param('id') id: string, @Body() updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto) {
        return this.medicamentAdministrationService.update(+medicamentId, +id, new MedicamentAdministrationDTO(updateMedicamentAdministrationDto));
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('medicamentId') medicamentId: number, @Param('id') id: string) {
        return this.medicamentAdministrationService.remove(+medicamentId, +id);
    }
}
