import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CreateHealthReportDto } from './dto/create-health-report.dto';
import { QueryParamsHealthReportDto } from './dto/query-params-health-report.dto';
import { UpdateHealthReportDto } from './dto/update-health-report.dto';
import { HealthReportService } from './health-report.service';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from '../enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('residents/:residentId/health-reports')
export class HealthReportController {
    logger = new Logger('HealthReportController');
    constructor(private readonly healthReportService: HealthReportService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post()
    create(@Body() createHealthReportDto: CreateHealthReportDto, @Param('residentId', ParseIntPipe) residentId: number) {
        this.logger.log(`Method: POST, Resident ID: ${residentId}, Data: ${JSON.stringify(createHealthReportDto)}`);
        return this.healthReportService.create(residentId, createHealthReportDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId: number, @Query() queryParams: QueryParamsHealthReportDto, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        this.logger.log(`Method: GET, Resident ID: ${residentId}, Query Params: ${JSON.stringify(queryParams)}`);
        return this.healthReportService.findAll(residentId, queryParams);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Param('residentId', ParseIntPipe) residentId: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        this.logger.log(`Method: GET, Resident ID: ${residentId}, Health Report ID: ${id}`);
        return this.healthReportService.findOne(residentId, id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number, @Body() updateHealthReportDto: UpdateHealthReportDto) {
        this.logger.log(`Method: PATCH, Resident ID: ${residentId}, Health Report ID: ${id}, Data: ${JSON.stringify(updateHealthReportDto)}`);
        return this.healthReportService.update(residentId, id, updateHealthReportDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('residentId', ParseIntPipe) residentId: number, @Param('id', ParseIntPipe) id: number) {
        this.logger.log(`Method: DELETE, Resident ID: ${residentId}, Health Report ID: ${id}`);
        return this.healthReportService.remove(residentId, id);
    }
}
