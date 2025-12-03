import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Permiso } from '../permiso/permiso.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Entity({ name: 'rol' })
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id_rol: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255 })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['organizacion', 'proyecto'],
    name: 'tipo_rol',
    default: 'organizacion'
  })
  tipo_rol: 'organizacion' | 'proyecto';

  @Column({ name: 'id_organizacion', nullable: true })
  id_organizacion: number | null;

  @ManyToOne(() => Organizacion, { nullable: true })
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizacion | null;

  @Column({ name: 'id_proyecto', nullable: true })
  id_proyecto: number | null;

  @ManyToOne(() => Proyecto, { nullable: true })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ length: 7, default: '#2196F3', nullable: true })
  color: string;

  @Column({ name: 'creado_por', nullable: true })
  creado_por: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'creado_por' })
  creador: Usuario | null;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @ManyToMany(() => Permiso, (permiso) => permiso.roles)
  @JoinTable({
    name: 'rol_permiso',
    joinColumn: { name: 'id_rol' },
    inverseJoinColumn: { name: 'id_permiso' },
  })
  permisos: Permiso[];
}
