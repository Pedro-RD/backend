import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Medicament } from '../../medicaments/entities/medicament.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Message } from '../../messages/entities/message.entity';
import { MedicamentAdministration } from '../../medicament-administration/entities/medicament-administration.entity';

export enum NotificationType {
    APPOINTMENT = 'Consulta',
    MEDICAMENT = 'Medicamento',
    MEDICAMENT_STOCK = 'Stock de Medicamento',
    MEDICAMENT_LOW = 'Baixo Stock de Medicamento',
    MESSAGE = 'Mensagem',
    MESSAGE_RELATIVE = 'Mensagem Familiar',
    SHIFT = 'Turno',
}

export enum NotificationStatus {
    DONE = 'Concluído',
    CANCELED = 'Cancelado',
    ONGOING = 'Em Curso',
    PENDING = 'Pendente',
}

@Entity()
export class NotificationEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'enum', enum: NotificationType, nullable: false })
    type: NotificationType;

    @Column({ type: 'enum', enum: NotificationStatus, nullable: false })
    status: NotificationStatus;

    @Column({ nullable: true })
    date: Date | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user?: User | null;

    @ManyToOne(() => Medicament, { nullable: true, onDelete: 'CASCADE' })
    medicament?: Medicament | null;

    @ManyToOne(() => Appointment, { nullable: true, onDelete: 'CASCADE' })
    appointment?: Appointment | null;

    @ManyToOne(() => Message, { nullable: true, onDelete: 'CASCADE' })
    userMessage?: Message | null;

    @ManyToOne(() => MedicamentAdministration, { nullable: true, onDelete: 'CASCADE' })
    medicamentAdministration?: MedicamentAdministration | null;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}
