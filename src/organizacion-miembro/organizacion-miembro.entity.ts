import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';

@Entity({ name: 'organizacion_miembro' })
export class OrganizacionMiembro {
  @PrimaryGeneratedColumn({ name: 'id_miembro' })
  id_miembro: number;

  @Column({ name: 'id_organizacion' })
  id_organizacion: number;

  @ManyToOne(() => Organizacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizacion;

  @Column({ name: 'id_voluntario' })
  id_voluntario: number;

  @ManyToOne(() => Voluntario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_voluntario' })
  voluntario: Voluntario;

  @Column({ name: 'id_rol_organizacion', nullable: true })
  id_rol_organizacion: number | null;

  @ManyToOne(() => Rol, { nullable: true })
  @JoinColumn({ name: 'id_rol_organizacion' })
  rol_organizacion: Rol | null;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'activo', 'inactivo'],
    default: 'pendiente'
  })
  estado: 'pendiente' | 'activo' | 'inactivo';

  @Column({ name: 'fecha_solicitud', type: 'datetime', nullable: true })
  fecha_solicitud: Date | null;

  @Column({ name: 'fecha_aprobacion', type: 'datetime', nullable: true })
  fecha_aprobacion: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}

