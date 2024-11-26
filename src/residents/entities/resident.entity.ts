import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { HealthReport } from '../../health-report/entities/health-report.entity';
import { Medicament } from '../../medicaments/entities/medicament.entity';
import { Message } from '../../messages/entities/message.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
import { CivilStatus } from '../enums/civilStatus.enum';
import { Diet } from '../enums/diet.enum';
import Mobility from '../enums/mobility.enum';

@Entity()
export class Resident {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    fiscalId: string;

    @Column()
    birthDate: Date;

    @Column({ nullable: true })
    specificCare: string | null;

    @Column({
        type: 'enum',
        enum: CivilStatus,
    })
    civilStatus: CivilStatus;

    @Column()
    nationality: string;

    @Column({
        type: 'enum',
        enum: Diet,
    })
    diet: Diet;

    @Column({
        type: 'enum',
        enum: Mobility,
        nullable: true,
    })
    mobility: Mobility;

    @Column({ nullable: true })
    dietRestrictions: string | null;

    @Column({ nullable: true })
    allergies: string | null;

    @Column({
        unique: true,
        nullable: true,
    })
    bedNumber: number;

    @ManyToMany(() => User, (relative) => relative.residents)
    @JoinTable({ name: 'resident_user' })
    relatives: User[];

    @OneToMany(() => HealthReport, (healthReport) => healthReport.resident)
    healthReports: HealthReport[];

    @OneToMany(() => Medicament, (medicament) => medicament.resident)
    medicaments: Medicament[];

    @OneToMany(() => Appointment, (appointment) => appointment.resident)
    appointments: Appointment[];

    @OneToMany(() => Payment, (payment) => payment.resident)
    payments: Payment[];

    @OneToMany(() => Message, (message) => message.resident)
    messages: Message[];

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
