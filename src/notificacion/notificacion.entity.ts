import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Entity({ name: 'notificacion' })
export class Notificacion {
  @PrimaryGeneratedColumn({ name: 'id_notificacion' })
  id_notificacion: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ length: 100 })
  titulo: string;

  @Column('text')
  mensaje: string;

  @Column({ length: 50, default: 'info' })
  tipo: string; // 'info', 'warning', 'error', 'success'

  @Column({ default: false })
  leida: boolean;

  @Column({ name: 'id_proyecto', nullable: true })
  id_proyecto: number;

  @ManyToOne(() => Proyecto, { nullable: true })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @Column({ length: 50, nullable: true })
  tipo_entidad: string; // 'asignacion', 'tarea', 'fase', 'proyecto'

  @Column({ name: 'id_entidad', nullable: true })
  id_entidad: number;

  @Column('json', { nullable: true })
  datos_adicionales: any;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}

