import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from '../../residents/entities/resident.entity';

export enum AppointmentStatus {
    Pending = 'Pendente',
    Cancelled = 'Cancelado',
    Done = 'Concluído',
}

export enum AppointmentType {
    MedicalAppointment = 'Consulta Médica',
    MedicalExam = 'Exame Médico',
    Other = 'Outro',
}

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: AppointmentType,
        nullable: false,
    })
    type: AppointmentType;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        nullable: false,
    })
    status: AppointmentStatus;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'timestamp',
        nullable: false,
    })
    start: Date;

    @Column({
        type: 'text',
        nullable: true,
    })
    observation: string;

    @ManyToOne(() => Resident, { nullable: false })
    @JoinColumn({ name: 'residentId' })
    resident: Resident;

    @Column({
        type: 'int',
        nullable: false,
    })
    residentId: number;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
