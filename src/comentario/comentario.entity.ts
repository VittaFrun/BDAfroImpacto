import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Fase } from '../fase/fase.entity';

@Entity({ name: 'comentario' })
@Index(['tipo_entidad', 'id_entidad'])
@Index(['id_usuario', 'creado_en'])
export class Comentario {
  @PrimaryGeneratedColumn({ name: 'id_comentario' })
  id_comentario: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column('text')
  contenido: string;

  @Column({ length: 50 })
  tipo_entidad: string; // 'tarea', 'proyecto', 'fase'

  @Column({ name: 'id_entidad' })
  id_entidad: number;

  // Relaciones opcionales según el tipo
  @Column({ name: 'id_tarea', nullable: true })
  id_tarea: number | null;

  @ManyToOne(() => Tarea, { nullable: true })
  @JoinColumn({ name: 'id_tarea' })
  tarea: Tarea | null;

  @Column({ name: 'id_proyecto', nullable: true })
  id_proyecto: number | null;

  @ManyToOne(() => Proyecto, { nullable: true })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto | null;

  @Column({ name: 'id_fase', nullable: true })
  id_fase: number | null;

  @ManyToOne(() => Fase, { nullable: true })
  @JoinColumn({ name: 'id_fase' })
  fase: Fase | null;

  // Comentario padre (para respuestas anidadas)
  @Column({ name: 'id_comentario_padre', nullable: true })
  id_comentario_padre: number | null;

  @ManyToOne(() => Comentario, (comentario) => comentario.respuestas, { nullable: true })
  @JoinColumn({ name: 'id_comentario_padre' })
  comentario_padre: Comentario | null;

  @OneToMany(() => Comentario, (comentario) => comentario.comentario_padre)
  respuestas: Comentario[];

  // Archivos adjuntos
  @Column('json', { nullable: true })
  archivos_adjuntos: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamaño: number;
  }> | null;

  // Menciones de usuarios (@usuario)
  @Column('json', { nullable: true })
  menciones: number[] | null; // IDs de usuarios mencionados

  // Edición
  @Column({ default: false })
  editado: boolean;

  @Column({ name: 'fecha_edicion', nullable: true })
  fecha_edicion: Date | null;

  // Eliminación suave
  @Column({ default: false })
  eliminado: boolean;

  @Column({ name: 'fecha_eliminacion', nullable: true })
  fecha_eliminacion: Date | null;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}

