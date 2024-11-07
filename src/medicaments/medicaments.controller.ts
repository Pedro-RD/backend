import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from "@nestjs/common";
import { MedicamentsService } from './medicaments.service';
import { CreateMedicamentDto } from './dto/create-medicament.dto';
import { UpdateMedicamentDto } from './dto/update-medicament.dto';
import { QueryParamsDto } from "../query/query-params.dto";
import { QueryParamsMedicamentsDto } from "../query/query-params-medicaments.dto";

@Controller('medicaments')
export class MedicamentsController {
  constructor(private readonly medicamentsService: MedicamentsService) {}

  @Post()
  create(@Body() createMedicamentDto: CreateMedicamentDto) {
    return this.medicamentsService.create(createMedicamentDto);
  }

  @Get()
  findAll(@Query() query: QueryParamsMedicamentsDto) {
    try {
      return this.medicamentsService.findAll({
        page: query.page || 1,
        limit: query.limit || 10,
        orderBy: query.orderBy || 'id',
        order: query.order || 'ASC',
        search: query.search || '',
        residentId: query.residentId || 0,
      });
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicamentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicamentDto: UpdateMedicamentDto) {
    return this.medicamentsService.update(+id, updateMedicamentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicamentsService.remove(+id);
  }
}
