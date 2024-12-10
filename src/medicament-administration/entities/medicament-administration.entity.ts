import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Medicament } from '../../medicaments/entities/medicament.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class MedicamentAdministration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hour: number;

    @Column()
    minute: number;

    @Column()
    dose: number;

    @ManyToOne(() => Medicament, (medicament) => medicament.medicamentAdministrations, { onDelete: 'CASCADE' })
    @JoinColumn()
    medicament: Medicament;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
