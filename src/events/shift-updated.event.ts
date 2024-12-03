import { Employee } from '../employee/entities/employee.entity';

export class ShiftUpdatedEvent {
    employee: Employee;

    constructor(employee: Employee) {
        this.employee = employee;
    }
}
