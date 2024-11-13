import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Resident } from "../../residents/entities/resident.entity";
import { MedicamentAdministration } from "../../medicament-administration/entities/medicament-administration.entity";

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

  @DeleteDateColumn()
  deletedAt: Date;
}
