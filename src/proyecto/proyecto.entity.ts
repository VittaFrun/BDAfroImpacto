import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estado } from '../estado/estado.entity';
import { Fase } from '../fase/fase.entity';
import { DonacionProyecto } from '../donacion-proyecto/donacion-proyecto.entity';
import { Movimiento } from '../movimiento/movimiento.entity';
import { Reporte } from '../reporte/reporte.entity';
import { Evaluacion } from '../evaluacion/evaluacion.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Certificado } from '../certificado/certificado.entity';
import { ProyectoBeneficio } from '../proyecto-beneficio/proyecto-beneficio.entity';
import { SolicitudInscripcion } from '../solicitud-inscripcion/solicitud-inscripcion.entity';
import { FormularioInscripcion } from '../formulario-inscripcion/formulario-inscripcion.entity';
import { Rol } from '../rol/rol.entity';

@Entity({ name: 'proyecto' })
export class Proyecto {
  @PrimaryGeneratedColumn({ name: 'id_proyecto' })
  id_proyecto: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column('text', { nullable: false })
  descripcion: string;

  @Column('text', { nullable: false })
  objetivo: string;

  @Column({ length: 100, nullable: false })
  ubicacion: string;

  @Column({ length: 50, nullable: true })
  categoria: string;

  @Column('date', { name: 'fecha_inicio' })
  fecha_inicio: Date;

  @Column('date', { name: 'fecha_fin' })
  fecha_fin: Date;

  @Column({ length: 255, name: 'imagen_principal', nullable: true })
  imagen_principal: string;

  @Column({ length: 255, nullable: true })
  banner: string;

  @Column({ length: 255, nullable: true })
  documento: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'presupuesto_total' })
  presupuesto_total: number;

  @Column({ name: 'es_publico', default: true })
  es_publico: boolean;

  @Column({ type: 'text', nullable: true })
  requisitos: string;

  @Column({ name: 'id_estado' })
  id_estado: number;

  @ManyToOne(() => Estado, (estado) => estado.proyectos)
  @JoinColumn({ name: 'id_estado' })
  estado: Estado;

  @Column({ name: 'id_organizacion' })
  id_organizacion: number;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.proyectos)
  @JoinColumn({ name: 'id_organizacion' })
  organizacion: Organizacion;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @OneToMany(() => Fase, (fase) => fase.proyecto)
  fases: Fase[];

  @OneToMany(() => DonacionProyecto, (donacionProyecto) => donacionProyecto.proyecto)
  donacionProyectos: DonacionProyecto[];

  @OneToMany(() => Movimiento, (movimiento) => movimiento.proyecto)
  movimientos: Movimiento[];

  @OneToMany(() => Reporte, (reporte) => reporte.proyecto)
  reportes: Reporte[];

  @OneToMany(() => Evaluacion, (evaluacion) => evaluacion.proyecto)
  evaluaciones: Evaluacion[];

  @OneToMany(() => HorasVoluntariadas, (horasVoluntariadas) => horasVoluntariadas.proyecto)
  horasVoluntariadas: HorasVoluntariadas[];

  @OneToMany(() => Certificado, (certificado) => certificado.proyecto)
  certificados: Certificado[];

  @OneToOne(() => ProyectoBeneficio, (beneficio) => beneficio.proyecto)
  beneficio: ProyectoBeneficio;

  @OneToMany(() => SolicitudInscripcion, (solicitud) => solicitud.proyecto)
  solicitudes: SolicitudInscripcion[];

  @OneToMany(() => FormularioInscripcion, (formulario) => formulario.proyecto)
  formularios: FormularioInscripcion[];

  @OneToMany(() => Rol, (rol) => rol.proyecto)
  roles: Rol[];
}
