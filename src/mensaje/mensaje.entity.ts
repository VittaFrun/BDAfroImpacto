import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../users/user.entity';

@Entity({ name: 'mensaje' })
@Index(['id_conversacion', 'creado_en'])
@Index(['id_remitente', 'creado_en'])
@Index(['id_destinatario', 'leido'])
export class Mensaje {
  @PrimaryGeneratedColumn({ name: 'id_mensaje' })
  id_mensaje: number;

  @Column({ name: 'id_conversacion', nullable: true })
  id_conversacion: number | null;

  @Column({ name: 'id_remitente' })
  id_remitente: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_remitente' })
  remitente: Usuario;

  @Column({ name: 'id_destinatario' })
  id_destinatario: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_destinatario' })
  destinatario: Usuario;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', length: 50, default: 'texto' })
  tipo: string; // 'texto', 'imagen', 'archivo', 'sistema'

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivo_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivo_nombre: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  archivo_tipo: string | null;

  @Column({ type: 'bigint', nullable: true })
  archivo_tamaño: number | null;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @Column({ type: 'datetime', nullable: true })
  fecha_leido: Date | null;

  @Column({ type: 'boolean', default: false })
  eliminado_remitente: boolean;

  @Column({ type: 'boolean', default: false })
  eliminado_destinatario: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}

