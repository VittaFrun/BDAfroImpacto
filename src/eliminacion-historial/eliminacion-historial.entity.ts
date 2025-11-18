import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Entity({ name: 'eliminacion_historial' })
export class EliminacionHistorial {
  @PrimaryGeneratedColumn({ name: 'id_eliminacion' })
  id_eliminacion: number;

  @Column({ length: 50 })
  tipo_entidad: string; // 'asignacion', 'tarea', 'fase', 'proyecto', 'voluntario'

  @Column({ name: 'id_entidad' })
  id_entidad: number;

  @Column('text', { nullable: true })
  nombre_entidad: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column({ name: 'id_proyecto', nullable: true })
  id_proyecto: number;

  @ManyToOne(() => Proyecto, { nullable: true })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;

  @Column({ name: 'id_usuario_eliminador' })
  id_usuario_eliminador: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario_eliminador' })
  usuario_eliminador: Usuario;

  @Column('text', { nullable: true })
  razon: string;

  @Column('json', { nullable: true })
  datos_adicionales: any; // Para almacenar información adicional como IDs relacionados

  @CreateDateColumn({ name: 'fecha_eliminacion' })
  fecha_eliminacion: Date;
}

