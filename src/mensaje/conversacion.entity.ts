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
import { Mensaje } from './mensaje.entity';

@Entity({ name: 'conversacion' })
@Index(['id_usuario1', 'id_usuario2'])
export class Conversacion {
  @PrimaryGeneratedColumn({ name: 'id_conversacion' })
  id_conversacion: number;

  @Column({ name: 'id_usuario1' })
  id_usuario1: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario1' })
  usuario1: Usuario;

  @Column({ name: 'id_usuario2' })
  id_usuario2: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario2' })
  usuario2: Usuario;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ultimo_mensaje: string | null;

  @Column({ type: 'datetime', nullable: true })
  fecha_ultimo_mensaje: Date | null;

  @Column({ type: 'int', default: 0 })
  mensajes_no_leidos_usuario1: number;

  @Column({ type: 'int', default: 0 })
  mensajes_no_leidos_usuario2: number;

  @Column({ type: 'boolean', default: false })
  archivada_usuario1: boolean;

  @Column({ type: 'boolean', default: false })
  archivada_usuario2: boolean;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.id_conversacion)
  mensajes: Mensaje[];

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}

