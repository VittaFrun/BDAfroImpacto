import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { FormularioInscripcion } from '../formulario-inscripcion/formulario-inscripcion.entity';
import { Rol } from '../rol/rol.entity';

@Entity({ name: 'organizacion' })
export class Organizacion {
  @PrimaryGeneratedColumn({ name: 'id_organizacion' })
  id_organizacion: number;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @OneToOne(() => Usuario, (usuario) => usuario.organizacion)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id_usuario' })
  usuario: Usuario;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 50, name: 'nombre_corto', nullable: true })
  nombre_corto: string;

  @Column({ length: 50 })
  tipo: string;

  @Column({ length: 255, name: 'sitio_web' })
  sitio_web: string;

  @Column({ length: 100 })
  pais: string;

  @Column({ length: 100 })
  ciudad: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('text', { name: 'areas_enfoque' })
  areas_enfoque: string;

  @Column('text', { name: 'mision_vision' })
  mision_vision: string;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Column({ length: 255, nullable: true })
  banner: string;

  @Column({ length: 7, name: 'color_primario', nullable: true })
  color_primario: string;

  @Column({ length: 7, name: 'color_secundario', nullable: true })
  color_secundario: string;

  @Column({ length: 20, default: 'claro' })
  tema: string;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @OneToMany(() => Donacion, (donacion) => donacion.organizacion)
  donaciones: Donacion[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.organizacion)
  proyectos: Proyecto[];

  @OneToMany(() => FormularioInscripcion, (formulario) => formulario.organizacion)
  formularios: FormularioInscripcion[];

  @OneToMany(() => Rol, (rol) => rol.organizacion)
  roles: Rol[];
}
