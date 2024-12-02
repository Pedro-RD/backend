import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { QueryParamsMedicamentsDto } from '../query/query-params-medicaments.dto';
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { MedicamentsService } from './medicaments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { User } from '../users/entities/user.entity';
import { UserReq } from '../auth/user.decorator';

@Controller('residents/:residentId/medicaments')
export class MedicamentsController {
    constructor(private readonly medicamentsService: MedicamentsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post()
    create(@Param('residentId') residentId: string, @Body() createMedicamentDto: CreateMedicamentDto) {
        return this.medicamentsService.create(+residentId, createMedicamentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get()
    findAll(@Query() query: QueryParamsMedicamentsDto, @Param('residentId', ParseIntPipe) residentId: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');

        return this.medicamentsService.findAll(+residentId, {
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
        });
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Param('residentId', ParseIntPipe) residentId: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        return this.medicamentsService.findOne(+residentId, +id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateMedicamentDto: UpdateMedicamentDto, @Param('residentId', ParseIntPipe) residentId: number) {
        return this.medicamentsService.update(residentId, id, updateMedicamentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number, @Param('residentId', ParseIntPipe) residentId: number) {
        return this.medicamentsService.remove(residentId, id);
    }
}
