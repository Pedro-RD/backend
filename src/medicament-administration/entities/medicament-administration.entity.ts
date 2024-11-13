import {
  Column,
  CreateDateColumn,
  DeleteDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Medicament } from "../../medicaments/entities/medicament.entity";

@Entity()
export class MedicamentAdministration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hour: string;

  @Column()
  dose: number;

  @ManyToOne(() => Medicament, (medicament) => medicament.medicamentAdministrations)
  @JoinColumn()
  medicament: Medicament;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
