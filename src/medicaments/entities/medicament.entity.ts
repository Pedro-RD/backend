import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MedicamentAdministration } from '../../medicament-administration/entities/medicament-administration.entity';
import { Resident } from '../../residents/entities/resident.entity';
import { NotificationEvent } from '../../notifications/entities/notification.entity';

@Entity()
export class Medicament {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    instructions: string;

    @Column()
    quantity: number;

    @Column()
    prescriptionQuantity: number;

    @Column()
    dueDate: Date;

    @Exclude()
    @ManyToOne(() => Resident, (resident) => resident.medicaments)
    @JoinTable()
    resident: Resident;

    @OneToMany(() => MedicamentAdministration, (medicamentAdministration) => medicamentAdministration.medicament)
    medicamentAdministrations: MedicamentAdministration[];

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
