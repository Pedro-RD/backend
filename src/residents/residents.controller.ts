import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from '../users/file-validation.pipe';

import { QueryParamsResidentsDto } from '../query/query-params-residents.dto';
import { BudgetResidentDto } from './dto/budget-resident.dto';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { ResidentsService } from './residents.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('residents')
export class ResidentsController {
    constructor(private readonly residentsService: ResidentsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Get('beds')
    async getBeds() {
        return this.residentsService.getListOfAvailableBeds();
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post()
    create(@Body() createResidentDto: CreateResidentDto) {
        return this.residentsService.create(createResidentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Get('budget')
    async getBudget(@Query() budgetDto: BudgetResidentDto) {
        console.log(budgetDto);
        return this.residentsService.getBudget(budgetDto.mobility);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker, Role.Relative)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && userReq.role !== Role.Caretaker) {
            const resident = userReq.residents.find((resident) => resident.id === +id);
            if (!resident) {
                throw new ForbiddenException('Não tem permissoes para aceder a este recurso');
            }
        }
        return this.residentsService.findOne(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateResidentDto: UpdateResidentDto) {
        return this.residentsService.update(id, updateResidentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.residentsService.remove(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Param('id', ParseIntPipe) id, @UploadedFile(new FileValidationPipe()) file: Express.Multer.File) {
        return this.residentsService.addProfilePicture(id, file);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Caretaker)
    @Delete(':id/upload')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeFile(@Param('id', ParseIntPipe) id) {
        return this.residentsService.clearProfilePicture(id);
    }
}
