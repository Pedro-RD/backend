import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from '../../residents/entities/resident.entity';
import { User } from '../../users/entities/user.entity';
import { Medicament } from '../../medicaments/entities/medicament.entity';
import { Message } from '../../messages/entities/message.entity';

export enum NotificationType {
    APPOINTMENT = 'CONSULTA',
    MEDICAMENT = 'MEDICAMENTO',
    MEDICAMENT_STOCK = 'MEDICAMENTO_STOCK',
    MEDICAMENT_LOW = 'MEDICAMENTO_BAIXO',
    MESSAGE = 'MENSAGEM',
    SHIFT = 'TURNO',
}

@Entity()
export class NotificationEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    messageContent: string;

    @Column({ type: 'enum', enum: NotificationType, nullable: true })
    type: NotificationType;

    @Column({ nullable: true })
    date: Date;

    @ManyToOne(() => Resident, { nullable: true })
    resident?: Resident | null;

    @ManyToOne(() => User, { nullable: true })
    user?: User | null;

    @ManyToOne(() => Medicament, { nullable: true })
    medicament?: Medicament | null;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}
