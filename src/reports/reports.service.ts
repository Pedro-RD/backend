import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Buffer } from 'buffer';
import { Workbook } from 'exceljs';
import { Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
        @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    ) {}

    async exportExcel(year: number, month: number): Promise<Buffer> {
        try {
            const workbook = new Workbook();
            const receivedSheet = workbook.addWorksheet('Recebido');
            const spentSheet = workbook.addWorksheet('Salarios');

            const payments = await this.paymentRepository.find({ where: { year, month }, relations: ['resident'] });

            const employeesQuery = this.employeeRepository.createQueryBuilder('employee');
            employeesQuery.leftJoinAndSelect('employee.user', 'user');
            employeesQuery.where('employee.contractStart <= :date', { date: new Date(`${year}-${month}-01`) });
            employeesQuery.andWhere('(employee.contractEnds >= :date OR employee.contractEnds IS NULL)', { date: new Date(`${year}-${month}-01`) });
            const employees = await employeesQuery.getMany();

            // Add headers for payments
            receivedSheet.columns = [
                { header: 'ID Residente', key: 'residentId', width: 15 },
                { header: 'Nome Residente', key: 'residentName', width: 15 },
                { header: 'Cama', key: 'bed', width: 10 },
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Valor', key: 'amount', width: 15 },
                { header: 'Data', key: 'date', width: 15 },
                { header: 'Mês', key: 'month', width: 10 },
                { header: 'Ano', key: 'year', width: 10 },
                { header: 'Tipo', key: 'type', width: 15 },
                { header: 'Observações', key: 'observation', width: 30 },
            ];

            // Add rows for payments
            payments.forEach((payment) => {
                receivedSheet.addRow({
                    residentId: payment.resident?.id || 0,
                    residentName: payment.resident?.name || 'Desconhecido',
                    bed: payment.resident.bedNumber,
                    id: payment.id || 0,
                    amount: payment.amount,
                    date: payment.date,
                    month: payment.month,
                    year: payment.year,
                    type: payment.type,
                    observation: payment.observation,
                });
            });

            // Add headers for employees
            spentSheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Salario', key: 'salary', width: 15 },
                { header: 'Inicio de Contrato', key: 'contractStart', width: 15 },
                { header: 'Fim de Contrato ', key: 'contractEnds', width: 15 },
                { header: 'ID do Utilizador', key: 'userId', width: 15 },
                { header: 'Nome do Utilizador', key: 'userName', width: 15 },
                { header: 'Email do Utilizador', key: 'userEmail', width: 15 },
                { header: 'Cargo do Utilizador', key: 'userRole', width: 15 },
            ];

            // Add rows for employees
            employees.forEach((employee) => {
                spentSheet.addRow({
                    id: employee.id || 0,
                    salary: employee.salary || 0,
                    contractStart: employee.contractStart,
                    contractEnds: employee.contractEnds,
                    userId: employee.user?.id || 0,
                    userName: employee.user?.name || 'Desconhecido',
                    userEmail: employee.user?.email || 'Desconhecido',
                    userRole: employee.user?.role || 'Desconhecido',
                });
            });

            const arrayBuffer = await workbook.xlsx.writeBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer;
        } catch (error) {
            this.logger.error(error.message, error.stack);
            throw error;
        }
    }
}
