import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from '../../residents/entities/resident.entity';
import { PaymentType } from '../enums/payment-type.enum';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', nullable: true })
    month: number;

    @Column({ type: 'int', nullable: true })
    year: number;

    @Column({ enum: PaymentType })
    type: PaymentType;

    @Column({ nullable: true })
    observation: string;

    @Exclude()
    @ManyToOne(() => Resident, (resident) => resident.payments)
    resident: Resident;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
