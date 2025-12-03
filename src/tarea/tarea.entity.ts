import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estado } from '../estado/estado.entity';
import { Fase } from '../fase/fase.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Movimiento } from '../movimiento/movimiento.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';

@Entity({ name: 'tarea' })
export class Tarea {
  @PrimaryGeneratedColumn({ name: 'id_tarea' })
  id_tarea: number;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('date', { name: 'fecha_inicio', nullable: true })
  fecha_inicio: Date;

  @Column('date', { name: 'fecha_fin', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'enum', enum: ['Alta', 'Media', 'Baja'], nullable: true })
  prioridad: string;

  @Column({ length: 100, nullable: true })
  complejidad: string;

  @Column('text', { nullable: true })
  observaciones: string;

  @Column({ name: 'id_estado', nullable: true })
  id_estado: number;

  @ManyToOne(() => Estado, (estado) => estado.tareas)
  @JoinColumn({ name: 'id_estado' })
  estado: Estado;

  @Column({ name: 'id_fase', nullable: true })
  id_fase: number;

  @ManyToOne(() => Fase, (fase) => fase.tareas)
  @JoinColumn({ name: 'id_fase' })
  fase: Fase;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @OneToMany(() => Asignacion, (asignacion) => asignacion.tarea)
  asignaciones: Asignacion[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.tarea)
  movimientos: Movimiento[];

  @OneToMany(() => HorasVoluntariadas, (horasVoluntariadas) => horasVoluntariadas.tarea)
  horasVoluntariadas: HorasVoluntariadas[];
}
