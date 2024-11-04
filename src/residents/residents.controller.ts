import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post, Query, UsePipes, ValidationPipe
} from "@nestjs/common";

import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { QueryParamsResidentsDto } from "../query/query-params-residents.dto";


@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  create(@Body() createResidentDto: CreateResidentDto) {
    return this.residentsService.create(createResidentDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }))
  findAll(@Query() query: QueryParamsResidentsDto) {
    try {
      return this.residentsService.findAll({
        page: query.page || 1,
        limit: query.limit || 10,
        orderBy: query.orderBy || 'id',
        order: query.order || 'ASC',
        search: query.search || '',
      });
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.residentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResidentDto: UpdateResidentDto,
  ) {
    return this.residentsService.update(+id, updateResidentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.residentsService.remove(+id);
  }
}
