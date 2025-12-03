import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Proyecto } from '../proyecto/proyecto.entity';

@Entity('reporte')
export class Reporte {
  @PrimaryGeneratedColumn({ name: 'id_reporte' })
  id_reporte: number;

  @Column({ length: 100 })
  tipo: string;

  @Column({ 
    type: 'enum',
    enum: ['PDF', 'Excel', 'CSV'],
    default: 'PDF'
  })
  formato: 'PDF' | 'Excel' | 'CSV';

  @Column({ 
    type: 'enum',
    enum: ['pendiente', 'generando', 'listo', 'error'],
    default: 'pendiente'
  })
  estado: 'pendiente' | 'generando' | 'listo' | 'error';

  @Column({ name: 'id_proyecto' })
  id_proyecto: number;

  @Column({ type: 'text', nullable: true })
  contenido: string; // Ruta del archivo o mensaje de error

  @Column({ type: 'boolean', default: false, name: 'incluir_graficos' })
  incluir_graficos: boolean;

  @Column({ type: 'int', default: 0 })
  descargas: number;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_inicio' })
  fecha_inicio: Date;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_fin' })
  fecha_fin: Date;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  // Relaciones
  @ManyToOne(() => Proyecto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proyecto' })
  proyecto: Proyecto;
}