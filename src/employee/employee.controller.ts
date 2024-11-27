import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryParamsEmployeeDto } from './dto/query-params-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto);
    }

    @Get()
    findAll(@Query() query: QueryParamsEmployeeDto) {
        return this.employeeService.findAll({
            order: query.order || 'DESC',
            orderBy: query.orderBy || 'createdAt',
            search: query.search || '',
            limit: query.limit || 10,
            page: query.page || 1,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeeService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.update(+id, updateEmployeeDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.employeeService.remove(+id);
    }
}
