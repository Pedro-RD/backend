import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CivilStatus } from '../enums/civilStatus.enum';
import { User } from '../../users/entities/user.entity';
import { Diet } from '../enums/diet.enum';

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

  @Column({ nullable: true })
  dietRestrictions: string | null;

  @Column({ nullable: true })
  allergies: string | null;

  @Column()
  bedNumber: number;

  @ManyToMany(() => User, (relative) => relative.residents)
  @JoinTable({ name: 'resident_user' })
  relatives: User[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
