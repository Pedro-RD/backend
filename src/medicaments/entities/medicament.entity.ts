import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Resident } from "../../residents/entities/resident.entity";

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

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
