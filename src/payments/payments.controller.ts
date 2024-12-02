import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryParamsPaymentsDto } from './dto/query-params-payments.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enums/roles.enum';
import { UserReq } from '../auth/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('residents/:residentId/payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Post()
    create(@Param('residentId', ParseIntPipe) residentId, @Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(residentId, createPaymentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative)
    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId, @Query() query: QueryParamsPaymentsDto, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        return this.paymentsService.findAll(residentId, {
            ...query,
            orderBy: query.orderBy || 'createdAt',
            order: query.order || 'DESC',
            page: query.page || 1,
            limit: query.limit || 10,
        });
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager, Role.Relative)
    @Get(':id')
    findOne(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number, @UserReq() userReq: User) {
        if (userReq.role !== Role.Manager && !userReq.residents.find((resident) => resident.id === residentId))
            throw new ForbiddenException('Não tem permissão para aceder a este recurso');
        return this.paymentsService.findOne(residentId, id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentsService.update(residentId, id, updatePaymentDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Manager)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.remove(residentId, id);
    }
}
