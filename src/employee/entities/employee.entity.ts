import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Shift } from '../../shifts/entities/shift.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    salary: number;

    @Column()
    contractStart: Date;

    @Column({ nullable: true })
    contractEnds: Date;


    @OneToOne(() => User, (user) => user.employee)
    @JoinColumn()
    user: User;

    @Exclude()
    @OneToMany(() => Shift, (shift) => shift.employee)
    shifts: Shift[];

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
