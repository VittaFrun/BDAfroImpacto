import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';

@Entity({ name: 'fase' })
export class Fase {
  @PrimaryGeneratedColumn({ name: 'id_fase' })
  id_fase: number;

  @Column({ length: 100 })
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column('int')
  orden: number;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ name: 'id_proyecto' })
  id_proyecto: number;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.fases)
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @OneToMany(() => Tarea, (tarea) => tarea.fase)
  tareas: Tarea[];
}
