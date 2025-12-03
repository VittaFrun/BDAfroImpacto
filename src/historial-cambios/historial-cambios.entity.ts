import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';

@Entity('historial_cambios')
export class HistorialCambios {
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  id_historial: number;

  @Column({ 
    type: 'enum',
    enum: ['proyecto', 'tarea', 'fase', 'voluntario', 'organizacion', 'asignacion', 'horas'],
    name: 'tipo_entidad'
  })
  tipo_entidad: 'proyecto' | 'tarea' | 'fase' | 'voluntario' | 'organizacion' | 'asignacion' | 'horas';

  @Column({ name: 'id_entidad' })
  id_entidad: number;

  @Column({ 
    type: 'enum',
    enum: ['crear', 'actualizar', 'eliminar', 'restaurar'],
    default: 'actualizar'
  })
  accion: 'crear' | 'actualizar' | 'eliminar' | 'restaurar';

  @Column({ type: 'json', nullable: true, name: 'datos_anteriores' })
  datos_anteriores: any;

  @Column({ type: 'json', nullable: true, name: 'datos_nuevos' })
  datos_nuevos: any;

  @Column({ type: 'json', nullable: true, name: 'campos_modificados' })
  campos_modificados: string[];

  @Column({ length: 500, nullable: true })
  descripcion: string;

  @Column({ length: 45, nullable: true, name: 'direccion_ip' })
  direccion_ip: string;

  @Column({ length: 500, nullable: true, name: 'user_agent' })
  user_agent: string;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  // Relaciones
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
