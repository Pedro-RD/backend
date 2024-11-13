import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from "@nestjs/common";
import { MedicamentAdministrationService } from './medicament-administration.service';
import { CreateMedicamentAdministrationDto } from './dto/create-medicament-administration.dto';
import { UpdateMedicamentAdministrationDto } from './dto/update-medicament-administration.dto';
import { QueryParamsMedicamentAdministrationDto } from "../query/query-params-medicament-administration.dto";

@Controller('medicament/:medicamentId/administration')
export class MedicamentAdministrationController {
  constructor(private readonly medicamentAdministrationService: MedicamentAdministrationService) {}

  @Post()
  create(
    @Param('medicamentId') medicamentId: number,
    @Body() createMedicamentAdministrationDto: CreateMedicamentAdministrationDto) {
    return this.medicamentAdministrationService.create(
        +medicamentId,
        createMedicamentAdministrationDto,
    );
  }

  @Get()
  findAll(
    @Param('medicamentId') medicamentId: number,
    @Query() query: QueryParamsMedicamentAdministrationDto) {
    try {
      return this.medicamentAdministrationService.findAll({
        page: query.page || 1,
        limit: query.limit || 10,
        orderBy: query.orderBy || 'id',
        order: query.order || 'ASC',
        search: query.search || '',
        medicamentId: +medicamentId,
      });
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get(':id')
  findOne(
    @Param('medicamentId') medicamentId: number,
    @Param('id') id: string
  ) {
    return this.medicamentAdministrationService.findOne(
      +medicamentId,
      +id
    );
  }

  @Patch(':id')
  update(
    @Param('medicamentId') medicamentId: number,
    @Param('id') id: string,
    @Body() updateMedicamentAdministrationDto: UpdateMedicamentAdministrationDto
  ) {
    return this.medicamentAdministrationService.update(
      +medicamentId,
      +id,
      updateMedicamentAdministrationDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('medicamentId') medicamentId: number,
    @Param('id') id: string
  ) {
      return this.medicamentAdministrationService.remove(
        +medicamentId,
        +id
      );
  }
}