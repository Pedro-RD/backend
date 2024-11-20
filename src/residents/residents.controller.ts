import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';

import { QueryParamsResidentsDto } from '../query/query-params-residents.dto';
import { BudgetResidentDto } from './dto/budget-resident.dto';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { ResidentsService } from './residents.service';

@Controller('residents')
export class ResidentsController {
    constructor(private readonly residentsService: ResidentsService) {}

    @Get('beds')
    async getBeds() {
        return this.residentsService.getListOfAvailableBeds();
    }

    @Post()
    create(@Body() createResidentDto: CreateResidentDto) {
        return this.residentsService.create(createResidentDto);
    }

    @Get()
    findAll(@Query() query: QueryParamsResidentsDto) {
        return this.residentsService.findAll({
            page: query.page || 1,
            limit: query.limit || 10,
            orderBy: query.orderBy || 'id',
            order: query.order || 'ASC',
            search: query.search || '',
        });
    }

    @Get('budget')
    async getBudget(@Query() budgetDto: BudgetResidentDto) {
        console.log(budgetDto);
        return this.residentsService.getBudget(budgetDto.mobility);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.residentsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateResidentDto: UpdateResidentDto) {
        return this.residentsService.update(+id, updateResidentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.residentsService.remove(+id);
    }
}
