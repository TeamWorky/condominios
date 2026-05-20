import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@condominios/common/entities/base.entity';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';
import { ResidentType } from '@condominios/shared/enums/resident-type.enum';
import { DocumentType } from '@condominios/shared/enums/document-type.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('residents')
export class Resident extends BaseEntity {
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type',
    default: DocumentType.RUT,
  })
  documentType: DocumentType;

  @Index('IDX_residents_document_number')
  @Column({ type: 'varchar', length: 50, name: 'document_number' })
  documentNumber: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', name: 'unit_id' })
  unitId: string;

  @ManyToOne(() => Unit, (unit) => unit.residents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({
    type: 'enum',
    enum: ResidentType,
    name: 'resident_type',
    default: ResidentType.TENANT,
  })
  residentType: ResidentType;

  @Column({ type: 'date', name: 'move_in_date', nullable: true })
  moveInDate?: Date;

  @Column({ type: 'date', name: 'move_out_date', nullable: true })
  moveOutDate?: Date;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Reservation, (reservation) => reservation.resident)
  reservations: Reservation[];
}
