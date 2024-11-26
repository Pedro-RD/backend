import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryParamsPaymentsDto } from './dto/query-params-payments.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('residents/:residentId/payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    create(@Param('residentId', ParseIntPipe) residentId, @Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(residentId, createPaymentDto);
    }

    @Get()
    findAll(@Param('residentId', ParseIntPipe) residentId, @Query() query: QueryParamsPaymentsDto) {
        return this.paymentsService.findAll(residentId, {
            ...query,
            orderBy: query.orderBy || 'createdAt',
            order: query.order || 'DESC',
            page: query.page || 1,
            limit: query.limit || 10,
        });
    }

    @Get(':id')
    findOne(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.findOne(residentId, id);
    }

    @Patch(':id')
    update(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentsService.update(residentId, id, updatePaymentDto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('residentId', ParseIntPipe) residentId, @Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.remove(residentId, id);
    }
}
