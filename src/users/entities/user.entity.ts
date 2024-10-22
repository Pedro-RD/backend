import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";
import { Role } from '../../auth/enums/roles.enum';
import { Exclude } from 'class-transformer';
import { Resident } from "../../residents/entities/resident.entity";

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  email: string;

  @Exclude()
  @Column({ length: 100 })
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true, length: 15 })
  phoneNumber: string;

  @Column({ length: 100 })
  address: string;

  @Column({ length: 10 })
  postcode: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 20 })
  fiscalId: string;

  @Column({ length: 50 })
  nationality: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @ManyToMany(
    () => Resident, (resident) => resident.relatives
  )
  residents: Resident[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
