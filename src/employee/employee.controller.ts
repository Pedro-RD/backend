import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryParamsEmployeeDto } from './dto/query-params-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('employees')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Post()
    create(@Body() createEmployeeDto: CreateEmployeeDto) {
        return this.employeeService.create(createEmployeeDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeeService.findOne(+id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        return this.employeeService.update(+id, updateEmployeeDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.employeeService.remove(+id);
    }
}
