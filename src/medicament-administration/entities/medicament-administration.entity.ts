import {
  Column,
  CreateDateColumn,
  DeleteDateColumn, Entity, JoinColumn,
  OneToOne,
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

  @OneToOne(() => Medicament, (medicament) => medicament.medicamentAdministration)
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
