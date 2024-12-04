import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Between, Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Resident } from '../residents/entities/resident.entity';
import { HealthReport } from '../health-report/entities/health-report.entity';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Shift } from '../shifts/entities/shift.entity';
import { NotificationEvent } from '../notifications/entities/notification.entity';

@Injectable()
export class DashboardsService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        @InjectRepository(Resident) private readonly residentRepository: Repository<Resident>,
        @InjectRepository(HealthReport) private readonly healthReportRepository: Repository<HealthReport>,
        @InjectRepository(Medicament) private readonly medicamentRepository: Repository<Medicament>,
        @InjectRepository(Appointment) private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Shift) private readonly shiftRepository: Repository<Shift>,
        @InjectRepository(NotificationEvent) private readonly notificationRepository: Repository<NotificationEvent>,
    ) {}

    async getManagerDashboardData() {
        const now = new Date();
        const employees = await this.employeeRepository.query(
            `SELECT * FROM employee WHERE start_date <= '${now.toISOString()}' AND (end_date IS NULL OR end_date >= '${now.toISOString()}')`,
        );

        const salariesThisMonth = await employees.reduce(async (acc, employee) => {
            const salary = await this.shiftRepository.query(
                `SELECT * FROM shift WHERE employee_id = ${employee.id} AND start >= '${new Date(now.getFullYear(), now.getMonth(), 1).toISOString()}' AND end <= '${new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()}'`,
            );

            return (await acc) + salary;
        }, 0);

        const residents = await this.residentRepository.find();

        const users = await this.userRepository.find();

        const payments = await this.paymentRepository.query(`SELECT * FROM payment WHERE month = ${now.getMonth()} AND year = ${now.getFullYear()}`);
        const totalPayments = payments.reduce((acc, payment) => acc + payment.amount, 0);

        return {
            employees: employees.length,
            residents: residents.length,
            users: users.length,
            totalPayments,
            salariesThisMonth,
        };
    }

    async getCaretakerDashboardData() {}

    async getRelativeDashboardData(id: number) {
        const now = new Date();
        const residents = await this.residentRepository.find({
            where: {
                relatives: {
                    id: id,
                },
            },
            relations: ['relatives'],
        });
        // 'appointments', 'healthReports', 'medicaments', 'payments'

        // check if relative monthly fee is paid
        const paymentData = await Promise.all(
            residents.map(async (resident) => {
                const payments = await this.paymentRepository.find({
                    where: {
                        resident: {
                            id: resident.id,
                        },
                        month: now.getMonth(),
                        year: now.getFullYear(),
                    },
                });

                return {
                    paid: payments.length > 0,
                };
            }),
        );

        // count the medicaments that the resident has to take
        const medicamentData = await Promise.all(
            residents.map(async (resident) => {
                const medicaments = await this.medicamentRepository.find({
                    where: {
                        resident: {
                            id: resident.id,
                        },
                    },
                });

                return {
                    medicaments: medicaments.length,
                };
            }),
        );

        // count the appointments that the resident has this month
        const appointmentData = await Promise.all(
            residents.map(async (resident) => {
                const appointments = await this.appointmentRepository.find({
                    where: {
                        resident: {
                            id: resident.id,
                        },
                        start: Between(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
                    },
                });

                return {
                    appointments: appointments.length,
                };
            }),
        );

        // get the last health report
        const healthReportData = await Promise.all(
            residents.map(async (resident) => {
                const healthReport = await this.healthReportRepository.findOne({
                    where: {
                        resident: {
                            id: resident.id,
                        },
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                });

                return {
                    healthReport,
                };
            }),
        );

        return residents.map((resident, index) => {
            return {
                ...resident,
                ...paymentData[index],
                ...medicamentData[index],
                ...appointmentData[index],
                ...healthReportData[index],
            };
        });
    }
}
