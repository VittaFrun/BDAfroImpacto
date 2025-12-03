import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialCambios } from './historial-cambios.entity';
import { Usuario } from '../users/user.entity';

export interface CambioData {
  tipo_entidad: 'proyecto' | 'tarea' | 'fase' | 'voluntario' | 'organizacion' | 'asignacion' | 'horas';
  id_entidad: number;
  accion: 'crear' | 'actualizar' | 'eliminar' | 'restaurar';
  datos_anteriores?: any;
  datos_nuevos?: any;
  descripcion?: string;
  direccion_ip?: string;
  user_agent?: string;
}

@Injectable()
export class HistorialCambiosService {
  constructor(
    @InjectRepository(HistorialCambios)
    private readonly historialRepo: Repository<HistorialCambios>,
  ) {}

  /**
   * Registra un cambio en el historial
   */
  async registrarCambio(cambio: CambioData, usuario: Usuario): Promise<HistorialCambios> {
    const campos_modificados = this.detectarCamposModificados(
      cambio.datos_anteriores,
      cambio.datos_nuevos
    );

    const historial = this.historialRepo.create({
      tipo_entidad: cambio.tipo_entidad,
      id_entidad: cambio.id_entidad,
      accion: cambio.accion,
      datos_anteriores: cambio.datos_anteriores,
      datos_nuevos: cambio.datos_nuevos,
      campos_modificados,
      descripcion: cambio.descripcion || this.generarDescripcionAutomatica(cambio, campos_modificados),
      direccion_ip: cambio.direccion_ip,
      user_agent: cambio.user_agent,
      id_usuario: usuario.id_usuario
    });

    return await this.historialRepo.save(historial);
  }

  /**
   * Obtiene el historial de cambios de una entidad específica
   */
  async obtenerHistorialEntidad(
    tipo_entidad: string,
    id_entidad: number,
    limite: number = 50
  ): Promise<HistorialCambios[]> {
    return await this.historialRepo.find({
      where: { tipo_entidad: tipo_entidad as any, id_entidad },
      relations: ['usuario'],
      order: { creado_en: 'DESC' },
      take: limite
    });
  }

  /**
   * Obtiene el historial de cambios de un proyecto completo
   */
  async obtenerHistorialProyecto(id_proyecto: number, limite: number = 100): Promise<any[]> {
    // Obtener cambios del proyecto
    const cambiosProyecto = await this.historialRepo.find({
      where: { tipo_entidad: 'proyecto', id_entidad: id_proyecto },
      relations: ['usuario'],
      order: { creado_en: 'DESC' }
    });

    // Obtener cambios de fases del proyecto
    const fases = await this.historialRepo.manager.query(`
      SELECT f.id_fase 
      FROM fase f 
      WHERE f.id_proyecto = ?
    `, [id_proyecto]);

    const cambiosFases = [];
    for (const fase of fases) {
      const cambios = await this.historialRepo.find({
        where: { tipo_entidad: 'fase', id_entidad: fase.id_fase },
        relations: ['usuario'],
        order: { creado_en: 'DESC' }
      });
      cambiosFases.push(...cambios);
    }

    // Obtener cambios de tareas del proyecto
    const tareas = await this.historialRepo.manager.query(`
      SELECT t.id_tarea 
      FROM tarea t 
      INNER JOIN fase f ON t.id_fase = f.id_fase 
      WHERE f.id_proyecto = ?
    `, [id_proyecto]);

    const cambiosTareas = [];
    for (const tarea of tareas) {
      const cambios = await this.historialRepo.find({
        where: { tipo_entidad: 'tarea', id_entidad: tarea.id_tarea },
        relations: ['usuario'],
        order: { creado_en: 'DESC' }
      });
      cambiosTareas.push(...cambios);
    }

    // Combinar y ordenar todos los cambios
    const todosCambios = [...cambiosProyecto, ...cambiosFases, ...cambiosTareas]
      .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
      .slice(0, limite);

    return todosCambios.map(cambio => ({
      ...cambio,
      entidad_nombre: this.obtenerNombreEntidad(cambio.tipo_entidad, cambio.datos_nuevos || cambio.datos_anteriores)
    }));
  }

  /**
   * Obtiene estadísticas del historial de cambios
   */
  async obtenerEstadisticasHistorial(id_proyecto?: number): Promise<any> {
    let whereClause = '';
    let params = [];

    if (id_proyecto) {
      // Para un proyecto específico, necesitamos incluir cambios de proyecto, fases y tareas
      whereClause = `
        WHERE (
          (h.tipo_entidad = 'proyecto' AND h.id_entidad = ?) OR
          (h.tipo_entidad = 'fase' AND h.id_entidad IN (
            SELECT f.id_fase FROM fase f WHERE f.id_proyecto = ?
          )) OR
          (h.tipo_entidad = 'tarea' AND h.id_entidad IN (
            SELECT t.id_tarea FROM tarea t 
            INNER JOIN fase f ON t.id_fase = f.id_fase 
            WHERE f.id_proyecto = ?
          ))
        )
      `;
      params = [id_proyecto, id_proyecto, id_proyecto];
    }

    const estadisticas = await this.historialRepo.manager.query(`
      SELECT 
        h.tipo_entidad,
        h.accion,
        COUNT(*) as total,
        DATE(h.creado_en) as fecha
      FROM historial_cambios h
      ${whereClause}
      GROUP BY h.tipo_entidad, h.accion, DATE(h.creado_en)
      ORDER BY fecha DESC
      LIMIT 30
    `, params);

    const resumen = await this.historialRepo.manager.query(`
      SELECT 
        COUNT(*) as total_cambios,
        COUNT(DISTINCT h.id_usuario) as usuarios_activos,
        COUNT(DISTINCT DATE(h.creado_en)) as dias_con_actividad
      FROM historial_cambios h
      ${whereClause}
      WHERE h.creado_en >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, params);

    return {
      resumen: resumen[0],
      actividad_diaria: estadisticas
    };
  }

  /**
   * Restaura una entidad a un estado anterior
   */
  async restaurarVersion(
    tipo_entidad: string,
    id_entidad: number,
    id_historial: number,
    usuario: Usuario
  ): Promise<any> {
    const cambio = await this.historialRepo.findOne({
      where: { id_historial }
    });

    if (!cambio) {
      throw new Error('Cambio no encontrado en el historial');
    }

    if (cambio.tipo_entidad !== tipo_entidad || cambio.id_entidad !== id_entidad) {
      throw new Error('El cambio no corresponde a la entidad especificada');
    }

    // Aquí implementarías la lógica específica para restaurar cada tipo de entidad
    // Por ejemplo, para un proyecto:
    if (tipo_entidad === 'proyecto') {
      await this.restaurarProyecto(id_entidad, cambio.datos_anteriores, usuario);
    }
    // Agregar más casos según sea necesario

    // Registrar la restauración
    await this.registrarCambio({
      tipo_entidad: tipo_entidad as any,
      id_entidad,
      accion: 'restaurar',
      datos_anteriores: cambio.datos_nuevos,
      datos_nuevos: cambio.datos_anteriores,
      descripcion: `Restaurado a la versión del ${cambio.creado_en.toLocaleString()}`
    }, usuario);

    return { message: 'Versión restaurada exitosamente' };
  }

  /**
   * Detecta qué campos fueron modificados
   */
  private detectarCamposModificados(datosAnteriores: any, datosNuevos: any): string[] {
    if (!datosAnteriores || !datosNuevos) return [];

    const campos = [];
    const todasLasClaves = new Set([
      ...Object.keys(datosAnteriores),
      ...Object.keys(datosNuevos)
    ]);

    for (const clave of todasLasClaves) {
      if (datosAnteriores[clave] !== datosNuevos[clave]) {
        campos.push(clave);
      }
    }

    return campos;
  }

  /**
   * Genera una descripción automática del cambio
   */
  private generarDescripcionAutomatica(cambio: CambioData, campos_modificados: string[]): string {
    const entidad = cambio.tipo_entidad;
    const accion = cambio.accion;

    switch (accion) {
      case 'crear':
        return `Se creó un nuevo ${entidad}`;
      case 'eliminar':
        return `Se eliminó el ${entidad}`;
      case 'actualizar':
        if (campos_modificados.length === 0) return `Se actualizó el ${entidad}`;
        return `Se actualizó el ${entidad}: ${campos_modificados.join(', ')}`;
      case 'restaurar':
        return `Se restauró el ${entidad} a una versión anterior`;
      default:
        return `Se modificó el ${entidad}`;
    }
  }

  /**
   * Obtiene el nombre de la entidad para mostrar
   */
  private obtenerNombreEntidad(tipo_entidad: string, datos: any): string {
    if (!datos) return `${tipo_entidad} desconocido`;

    switch (tipo_entidad) {
      case 'proyecto':
        return datos.nombre || `Proyecto ${datos.id_proyecto || ''}`;
      case 'tarea':
        return datos.descripcion || `Tarea ${datos.id_tarea || ''}`;
      case 'fase':
        return datos.nombre || `Fase ${datos.id_fase || ''}`;
      case 'voluntario':
        return datos.nombre || `Voluntario ${datos.id_voluntario || ''}`;
      case 'organizacion':
        return datos.nombre || `Organización ${datos.id_organizacion || ''}`;
      default:
        return `${tipo_entidad} ${datos.id || ''}`;
    }
  }

  /**
   * Restaura un proyecto a un estado anterior
   */
  private async restaurarProyecto(id_proyecto: number, datosAnteriores: any, usuario: Usuario): Promise<void> {
    // Implementar lógica específica para restaurar proyecto
    // Esto requeriría acceso al ProyectoService
    console.log(`Restaurando proyecto ${id_proyecto} para usuario ${usuario.id_usuario}`);
    // TODO: Implementar restauración real
  }
}
