import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryParamsShiftDto } from './dto/query-params-shift.dto';
import { ShiftsService } from './shifts.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserReq } from '../auth/user.decorator';

@Controller('employees/:employeeId/shifts')
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Post()
    create(@Param('employeeId', ParseIntPipe) employeeID: number, @Body() createShiftDto: CreateShiftDto) {
        return this.shiftsService.create(employeeID, createShiftDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Get()
    findAll(@Param('employeeId', ParseIntPipe) employeeID: number, @Query() query: QueryParamsShiftDto, @UserReq() userReq) {
        if (userReq.role !== Role.Manager && userReq.employee.id !== employeeID) {
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        }
        return this.shiftsService.findAll(employeeID, query);
    }
}
