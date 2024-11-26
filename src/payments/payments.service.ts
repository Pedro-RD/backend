import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Resident } from '../residents/entities/resident.entity';
import { ResidentsService } from '../residents/residents.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryParamsPaymentsDto } from './dto/query-params-payments.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentType } from './enums/payment-type.enum';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    constructor(
        @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
        @InjectRepository(Resident) private residentsRepository: Repository<Resident>,
        private residentsService: ResidentsService,
    ) {}

    async create(residentId: number, createPaymentDto: CreatePaymentDto) {
        this.logger.log(`Creating payment for resident ${residentId} with data ${JSON.stringify(createPaymentDto)}`);
        return createPaymentDto.type === PaymentType.MonthlyFee
            ? await this.createMonthlyFee(residentId, createPaymentDto)
            : await this.createOtherPayment(residentId, createPaymentDto);
    }

    async createMonthlyFee(residentId: number, createPaymentDto: CreatePaymentDto) {
        this.logger.log(`Creating monthly fee for resident ${residentId} with data ${JSON.stringify(createPaymentDto)}`);
        // check if resident exists
        if (!createPaymentDto.month || !createPaymentDto.year) {
            this.logger.error('Month and year are required for monthly fee');
            throw new NotFoundException('Mês e ano são obrigatórios para guardar a mensalidade');
        }

        const resident = await this.residentsRepository.findOne({
            where: { id: residentId },
        });

        if (!resident) {
            this.logger.error(`Resident with id ${residentId} not found`);
            throw new NotFoundException(`O residente com id ${residentId} não foi encontrado`);
        }

        createPaymentDto.amount = this.residentsService.calculateTotalFee(resident.mobility);

        // check if payment already exists

        const payment = await this.paymentsRepository.findOne({
            where: { resident, month: createPaymentDto.month, year: createPaymentDto.year },
        });

        if (payment) {
            this.logger.error(`Payment for month ${createPaymentDto.month} and year ${createPaymentDto.year} already exists`);
            throw new NotFoundException(`Já existe uma mensalidade para o mês ${createPaymentDto.month} e ano ${createPaymentDto.year}`);
        }

        // create payment

        const newPayment = this.paymentsRepository.create({
            ...createPaymentDto,
            resident,
        });

        const result = await this.paymentsRepository.save(newPayment);
        this.logger.log(`Monthly fee created for resident ${residentId} with data ${JSON.stringify(result)}`);

        return plainToClass(Payment, result);
    }
    async createOtherPayment(residentId: number, { observation, amount, date, type }: CreatePaymentDto) {
        this.logger.log(`Creating other payment for resident ${residentId} with data ${JSON.stringify({ observation, amount, date, type })}`);

        if (!amount || amount <= 0) {
            this.logger.error('Amount is required for other payment');
            throw new NotFoundException('O valor é obrigatório para guardar o pagamento');
        }

        // check if resident exists
        const resident = await this.residentsRepository.findOne({
            where: { id: residentId },
        });

        if (!resident) {
            this.logger.error(`Resident with id ${residentId} not found`);
            throw new NotFoundException(`O residente com id ${residentId} não foi encontrado`);
        }

        // create payment
        const newPayment = this.paymentsRepository.create({
            observation,
            amount,
            date,
            type,
            resident,
        });

        const result = await this.paymentsRepository.save(newPayment);
        this.logger.log(`Other payment created for resident ${residentId} with data ${JSON.stringify(result)}`);

        return plainToClass(Payment, result);
    }

    async findAll(residentId: number, { order, orderBy, limit, page, search, from, to, type }: QueryParamsPaymentsDto) {
        this.logger.log(`Finding all payments for resident ${residentId} with data ${JSON.stringify({ order, orderBy, limit, page, search, from, to })}`);

        const queryBuilder = this.paymentsRepository.createQueryBuilder('payment');
        queryBuilder.leftJoinAndSelect('payment.resident', 'resident');

        queryBuilder.where('resident.id = :residentId', { residentId });

        if (search) {
            queryBuilder.andWhere('payment.observation ILIKE :search', { search: `%${search}%` });
        }

        if (from) {
            queryBuilder.andWhere('payment.date >= :from', { from });
        }

        if (to) {
            queryBuilder.andWhere('payment.date <= :to', { to });
        }

        if (type) {
            queryBuilder.andWhere('payment.type = :type', { type });
        }

        const [payments, totalCount] = await queryBuilder
            .orderBy(`payment.${orderBy}`, order)
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        this.logger.log(`Payments found for resident ${residentId} with data ${JSON.stringify(payments)} Total: ${totalCount}`);

        return {
            data: payments.map((payment) => plainToClass(Payment, payment)),
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        };
    }

    async findOne(residentId: number, id: number) {
        this.logger.log(`Finding payment with id ${id} for resident ${residentId}`);
        const result = await this.paymentsRepository.findOne({
            where: { id, resident: { id: residentId } },
        });

        if (!result) {
            this.logger.error(`Payment with id ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`O pagamento com id ${id} não foi encontrado para o residente ${residentId}`);
        }

        this.logger.log(`Payment found with id ${id} for resident ${residentId}`);
        return plainToClass(Payment, result);
    }

    async update(residentId: number, id: number, updatePaymentDto: UpdatePaymentDto) {
        this.logger.log(`Updating payment with id ${id} for resident ${residentId} with data ${JSON.stringify(updatePaymentDto)}`);
        const payment = await this.paymentsRepository.findOne({
            where: { id, resident: { id: residentId } },
        });

        if (!payment) {
            this.logger.error(`Payment with id ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`O pagamento com id ${id} não foi encontrado para o residente ${residentId}`);
        }

        const newPayment =
            payment.type === PaymentType.MonthlyFee
                ? {
                      date: updatePaymentDto.date ?? payment.date,
                      month: updatePaymentDto.month ?? payment.month,
                      year: updatePaymentDto.year ?? payment.year,
                      observation: updatePaymentDto.observation,
                  }
                : {
                      amount: updatePaymentDto.amount ?? payment.amount,
                      date: updatePaymentDto.date ?? payment.date,
                      observation: updatePaymentDto.observation ?? payment.observation,
                  };

        const updatedPayment = await this.paymentsRepository.save({
            ...payment,
            ...newPayment,
        });

        this.logger.log(`Payment updated with id ${id} for resident ${residentId} with data ${JSON.stringify(updatedPayment)}`);
        return plainToClass(Payment, updatedPayment);
    }

    async remove(residentId: number, id: number) {
        this.logger.log(`Removing payment with id ${id} for resident ${residentId}`);
        const payment = await this.paymentsRepository.findOne({
            where: { id, resident: { id: residentId } },
        });

        if (!payment) {
            this.logger.error(`Payment with id ${id} not found for resident ${residentId}`);
            throw new NotFoundException(`O pagamento com id ${id} não foi encontrado para o residente ${residentId}`);
        }

        await this.paymentsRepository.softDelete(id);
        this.logger.log(`Payment removed with id ${id} for resident ${residentId}`);
    }
}
