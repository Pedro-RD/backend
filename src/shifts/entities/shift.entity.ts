import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { ShiftType } from '../enums/shift.enum';

@Entity()
export class Shift {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    day: Date;

    @Column({ enum: ShiftType })
    shift: ShiftType;

    @Exclude()
    @ManyToOne(() => Employee, (employee) => employee.shifts, { onDelete: 'CASCADE' })
    employee: Employee;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
