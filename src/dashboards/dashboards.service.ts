import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { Resident } from '../residents/entities/resident.entity';
import { HealthReport } from '../health-report/entities/health-report.entity';
import { Medicament } from '../medicaments/entities/medicament.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Payment } from '../payments/entities/payment.entity';

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
    ) {}

    async getManagerDashboardData() {
        const now = new Date();
        const employees = await this.employeeRepository.find({
            where: {
                contractStart: LessThanOrEqual(new Date(now.getFullYear(), now.getMonth(), 1)),
                contractEnds: MoreThanOrEqual(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
            },
        });

        const salariesThisMonth = employees.reduce((acc, employee) => acc + employee.salary, 0);

        const employeesLastMonth = await this.employeeRepository.find({
            where: {
                contractStart: LessThanOrEqual(
                    new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 11 : now.getMonth() - 1, 1),
                ),
                contractEnds: MoreThanOrEqual(
                    new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 11 : now.getMonth() - 1, 0),
                ),
            },
        });

        const salariesLastMonth = employeesLastMonth.reduce((acc, employee) => acc + employee.salary, 0);

        const employeesMonthBeforeLast = await this.employeeRepository.find({
            where: {
                contractStart: LessThanOrEqual(
                    new Date(
                        now.getMonth() === 1 ? now.getFullYear() - 1 : now.getFullYear(),
                        now.getMonth() === 1 ? 11 : now.getMonth() === 0 ? 10 : now.getMonth() - 2,
                        1,
                    ),
                ),
                contractEnds: MoreThanOrEqual(
                    new Date(
                        now.getMonth() === 1 ? now.getFullYear() - 1 : now.getFullYear(),
                        now.getMonth() === 1 ? 11 : now.getMonth() === 0 ? 10 : now.getMonth() - 2,
                        0,
                    ),
                ),
            },
        });

        const salariesMonthBeforeLast = employeesMonthBeforeLast.reduce((acc, employee) => acc + employee.salary, 0);

        const residents = await this.residentRepository.find();

        const users = await this.userRepository.find();

        const paymentsThisMonth = await this.paymentRepository.find({
            where: {
                month: now.getMonth(),
                year: now.getFullYear(),
            },
        });
        const totalPaymentsThisMonth = paymentsThisMonth.reduce((acc, payment) => acc + payment.amount, 0);

        const paymentsLastMonth = await this.paymentRepository.find({
            where: {
                month: now.getMonth() === 0 ? 11 : now.getMonth() - 1,
                year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
            },
        });
        const totalPaymentsLastMonth = paymentsLastMonth.reduce((acc, payment) => acc + payment.amount, 0);

        const paymentsMonthBeforeLast = await this.paymentRepository.find({
            where: {
                month: now.getMonth() === 1 ? 11 : now.getMonth() === 0 ? 10 : now.getMonth() - 2,
                year: now.getMonth() === 1 ? now.getFullYear() - 1 : now.getFullYear(),
            },
        });
        const totalPaymentsMonthBeforeLast = paymentsMonthBeforeLast.reduce((acc: number, payment: Payment) => acc + payment.amount, 0);

        return {
            employees: employees.length,
            residents: residents.length,
            users: users.length,
            payments: [
                {
                    date: new Date(now.getFullYear(), now.getMonth(), 1),
                    total: totalPaymentsThisMonth,
                },
                {
                    date: new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 11 : now.getMonth() - 1, 1),
                    total: totalPaymentsLastMonth,
                },
                {
                    date: new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 10 : now.getMonth() - 2, 1),
                    total: totalPaymentsMonthBeforeLast,
                },
            ],
            salaries: [
                {
                    date: new Date(now.getFullYear(), now.getMonth(), 1),
                    total: salariesThisMonth,
                },
                {
                    date: new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 11 : now.getMonth() - 1, 1),
                    total: salariesLastMonth,
                },
                {
                    date: new Date(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), now.getMonth() === 0 ? 10 : now.getMonth() - 2, 1),
                    total: salariesMonthBeforeLast,
                },
            ],
        };
    }

    async getCaretakerDashboardData() {
        const now = new Date();

        // get number of residents
        const residents = await this.residentRepository.find();

        // get number of appointments for this month
        const appointmentsThisMonth = await this.appointmentRepository.find({
            where: {
                start: Between(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
            },
            relations: ['resident'],
        });

        // appointments that are due today
        const appointmentsToday = appointmentsThisMonth.filter((appointment) => {
            return appointment.start.getDate() === now.getDate();
        });

        // appointments that are due tomorrow
        const appointmentsTomorrow = appointmentsThisMonth.filter((appointment) => {
            return appointment.start.getDate() === now.getDate() + 1;
        });

        // get number of medicaments that have to be taken today
        const medicaments = await this.medicamentRepository.find({
            where: {
                resident: {
                    id: In(residents.map((resident) => resident.id)),
                },
            },
            relations: ['resident'],
        });

        // number of health reports that have been created today
        const healthReportsToday = await this.healthReportRepository.find({
            where: {
                createdAt: Between(new Date(now.getFullYear(), now.getMonth(), now.getDate()), new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
            },
        });

        // number of health reports that have been created this week
        const healthReportsThisWeek = await this.healthReportRepository.find({
            where: {
                createdAt: Between(
                    new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7),
                    new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
                ),
            },
        });

        return {
            numberOfResidents: residents.length,
            appointmentsThisMonth: appointmentsThisMonth.length,
            appointmentsToday: appointmentsToday.length,
            appointmentsTomorrow: appointmentsTomorrow.length,
            numberOfMedicaments: medicaments.length,
            healthReportsToday: healthReportsToday.length,
            healthReportsThisWeek: healthReportsThisWeek.length,
        };
    }

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
