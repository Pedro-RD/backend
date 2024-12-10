import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Resident } from '../../residents/entities/resident.entity';

@Entity()
export class HealthReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    arterialBloodPressure: string;

    @Column('decimal', { nullable: true, precision: 5, scale: 2 })
    temperature: number; //graus celsius

    @Column('decimal', { nullable: true, precision: 5, scale: 2 })
    height: number; //metro

    @Column('decimal', { nullable: true, precision: 5, scale: 2 })
    weight: number; //quilo

    @Column({ nullable: true })
    respiratoryRate: number; // Frequência Respiratória (ciclos respiratórios por min)

    @Column({ nullable: true })
    heartRate: number; // Frequência Cardíaca (batimentos por min)

    @Column({ nullable: true })
    bloodGlucoseLevel: number; // Nível de Glicemia

    @Column({ nullable: true })
    mobility: string;

    @Column({ nullable: true })
    hydrationLevel: string;

    @Column({ nullable: true })
    cognitiveEmotionalAssessment: string; // Avaliação Cognitiva e Emocional

    @Column('decimal', { nullable: true, precision: 5, scale: 2 })
    bloodOxygenLevel: number; // Taxa de Oxigênio no Sangue

    @Exclude()
    @ManyToOne(() => Resident, (resident) => resident.healthReports, { onDelete: 'CASCADE' })
    @JoinColumn()
    resident: Resident;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
