import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryParamsShiftDto } from './dto/query-params-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('employees/:employeeId/shifts')
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) {}

    @Post()
    create(@Param('employeeId', ParseIntPipe) employeeID: number, @Body() createShiftDto: CreateShiftDto) {
        return this.shiftsService.create(employeeID, createShiftDto);
    }

    @Get()
    findAll(@Param('employeeId', ParseIntPipe) employeeID: number, @Query() query: QueryParamsShiftDto) {
        return this.shiftsService.findAll(employeeID, query);
    }
}
