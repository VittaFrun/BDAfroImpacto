import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Fase } from '../fase/fase.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';

export interface ProjectAnalytics {
  resumen: {
    totalProyectos: number;
    proyectosActivos: number;
    proyectosCompletados: number;
    totalVoluntarios: number;
    totalHoras: number;
  };
  tendencias: {
    proyectosPorMes: any[];
    horasPorMes: any[];
    voluntariosPorMes: any[];
  };
  rendimiento: {
    promedioCompletacion: number;
    eficienciaHoras: number;
    retencionVoluntarios: number;
  };
}

export interface OrganizationAnalytics {
  proyectos: {
    total: number;
    activos: number;
    completados: number;
    enPausa: number;
  };
  voluntarios: {
    total: number;
    activos: number;
    nuevosEsteMes: number;
    retencion: number;
  };
  horas: {
    totalRegistradas: number;
    totalVerificadas: number;
    promedioSemanal: number;
    tendencia: 'subiendo' | 'bajando' | 'estable';
  };
  rendimiento: {
    tareasCompletadasATiempo: number;
    satisfaccionVoluntarios: number;
    eficienciaProyectos: number;
  };
}

export interface VolunteerAnalytics {
  actividad: {
    proyectosParticipados: number;
    tareasCompletadas: number;
    horasContribuidas: number;
    diasActivo: number;
  };
  rendimiento: {
    tareasATiempo: number;
    calificacionPromedio: number;
    consistencia: number;
  };
  progreso: {
    horasPorMes: any[];
    tareasCompletadasPorMes: any[];
    habilidadesDesarrolladas: string[];
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,
    @InjectRepository(HorasVoluntariadas)
    private readonly horasRepo: Repository<HorasVoluntariadas>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
  ) {}

  /**
   * Obtiene analytics generales de la plataforma
   */
  async getProjectAnalytics(): Promise<ProjectAnalytics> {
    // Resumen general
    const [totalProyectos, proyectosActivos, proyectosCompletados] = await Promise.all([
      this.proyectoRepo.count(),
      this.proyectoRepo.count({ where: { id_estado: 2 } }), // En progreso
      this.proyectoRepo.count({ where: { id_estado: 3 } }), // Completado
    ]);

    const totalVoluntarios = await this.voluntarioRepo.count();
    
    const totalHorasResult = await this.horasRepo
      .createQueryBuilder('horas')
      .select('SUM(horas.horas_trabajadas)', 'total')
      .getRawOne();
    
    const totalHoras = parseFloat(totalHorasResult?.total || '0');

    // Tendencias por mes (últimos 12 meses)
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 12);

    const proyectosPorMes = await this.proyectoRepo
      .createQueryBuilder('proyecto')
      .select('YEAR(proyecto.creado_en) as año, MONTH(proyecto.creado_en) as mes, COUNT(*) as total')
      .where('proyecto.creado_en >= :fechaInicio', { fechaInicio })
      .groupBy('YEAR(proyecto.creado_en), MONTH(proyecto.creado_en)')
      .orderBy('año, mes')
      .getRawMany();

    const horasPorMes = await this.horasRepo
      .createQueryBuilder('horas')
      .select('YEAR(horas.fecha) as año, MONTH(horas.fecha) as mes, SUM(horas.horas_trabajadas) as total')
      .where('horas.fecha >= :fechaInicio', { fechaInicio })
      .groupBy('YEAR(horas.fecha), MONTH(horas.fecha)')
      .orderBy('año, mes')
      .getRawMany();

    const voluntariosPorMes = await this.voluntarioRepo
      .createQueryBuilder('voluntario')
      .select('YEAR(voluntario.creado_en) as año, MONTH(voluntario.creado_en) as mes, COUNT(*) as total')
      .where('voluntario.creado_en >= :fechaInicio', { fechaInicio })
      .groupBy('YEAR(voluntario.creado_en), MONTH(voluntario.creado_en)')
      .orderBy('año, mes')
      .getRawMany();

    // Cálculos de rendimiento
    const proyectosConFechas = await this.proyectoRepo
      .createQueryBuilder('proyecto')
      .where('proyecto.fecha_fin IS NOT NULL')
      .andWhere('proyecto.id_estado = 3') // Completados
      .getMany();

    let promedioCompletacion = 0;
    if (proyectosConFechas.length > 0) {
      const tiemposCompletacion = proyectosConFechas.map(p => {
        const inicio = new Date(p.fecha_inicio);
        const fin = new Date(p.fecha_fin);
        return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // días
      });
      promedioCompletacion = tiemposCompletacion.reduce((a, b) => a + b, 0) / tiemposCompletacion.length;
    }

    // Eficiencia de horas (horas planificadas vs reales)
    const eficienciaHoras = await this.calculateHourEfficiency();

    // Retención de voluntarios (voluntarios activos en los últimos 3 meses)
    const fechaRetencion = new Date();
    fechaRetencion.setMonth(fechaRetencion.getMonth() - 3);
    
    const voluntariosActivos = await this.horasRepo
      .createQueryBuilder('horas')
      .select('COUNT(DISTINCT horas.id_voluntario)', 'total')
      .where('horas.fecha >= :fechaRetencion', { fechaRetencion })
      .getRawOne();

    const retencionVoluntarios = totalVoluntarios > 0 
      ? (parseInt(voluntariosActivos.total) / totalVoluntarios) * 100 
      : 0;

    return {
      resumen: {
        totalProyectos,
        proyectosActivos,
        proyectosCompletados,
        totalVoluntarios,
        totalHoras: Math.round(totalHoras * 100) / 100
      },
      tendencias: {
        proyectosPorMes: proyectosPorMes.map(p => ({
          periodo: `${p.año}-${String(p.mes).padStart(2, '0')}`,
          total: parseInt(p.total)
        })),
        horasPorMes: horasPorMes.map(h => ({
          periodo: `${h.año}-${String(h.mes).padStart(2, '0')}`,
          total: parseFloat(h.total)
        })),
        voluntariosPorMes: voluntariosPorMes.map(v => ({
          periodo: `${v.año}-${String(v.mes).padStart(2, '0')}`,
          total: parseInt(v.total)
        }))
      },
      rendimiento: {
        promedioCompletacion: Math.round(promedioCompletacion),
        eficienciaHoras: Math.round(eficienciaHoras * 100) / 100,
        retencionVoluntarios: Math.round(retencionVoluntarios * 100) / 100
      }
    };
  }

  /**
   * Obtiene analytics específicos de una organización
   */
  async getOrganizationAnalytics(organizacionId: number): Promise<OrganizationAnalytics> {
    // Proyectos de la organización
    const [total, activos, completados, enPausa] = await Promise.all([
      this.proyectoRepo.count({ where: { id_organizacion: organizacionId } }),
      this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 2 } }),
      this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 3 } }),
      this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 4 } }),
    ]);

    // Voluntarios únicos en proyectos de la organización
    const voluntariosUnicos = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .leftJoin('tarea.fase', 'fase')
      .leftJoin('fase.proyecto', 'proyecto')
      .select('COUNT(DISTINCT asignacion.id_voluntario)', 'total')
      .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
      .getRawOne();

    // Voluntarios activos (con actividad en los últimos 30 días)
    const fechaActividad = new Date();
    fechaActividad.setDate(fechaActividad.getDate() - 30);

    const voluntariosActivos = await this.horasRepo
      .createQueryBuilder('horas')
      .leftJoin('horas.proyecto', 'proyecto')
      .select('COUNT(DISTINCT horas.id_voluntario)', 'total')
      .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
      .andWhere('horas.fecha >= :fechaActividad', { fechaActividad })
      .getRawOne();

    // Nuevos voluntarios este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const nuevosVoluntarios = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .leftJoin('tarea.fase', 'fase')
      .leftJoin('fase.proyecto', 'proyecto')
      .leftJoin('asignacion.voluntario', 'voluntario')
      .select('COUNT(DISTINCT asignacion.id_voluntario)', 'total')
      .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
      .andWhere('voluntario.creado_en >= :inicioMes', { inicioMes })
      .getRawOne();

    // Horas de la organización
    const horasStats = await this.horasRepo
      .createQueryBuilder('horas')
      .leftJoin('horas.proyecto', 'proyecto')
      .select([
        'SUM(horas.horas_trabajadas) as totalRegistradas',
        'SUM(CASE WHEN horas.verificada = 1 THEN horas.horas_trabajadas ELSE 0 END) as totalVerificadas'
      ])
      .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
      .getRawOne();

    // Promedio semanal de horas (últimas 4 semanas)
    const hace4Semanas = new Date();
    hace4Semanas.setDate(hace4Semanas.getDate() - 28);

    const horasSemanales = await this.horasRepo
      .createQueryBuilder('horas')
      .leftJoin('horas.proyecto', 'proyecto')
      .select('SUM(horas.horas_trabajadas) / 4', 'promedio')
      .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
      .andWhere('horas.fecha >= :hace4Semanas', { hace4Semanas })
      .getRawOne();

    // Calcular tendencia de horas
    const tendenciaHoras = await this.calculateHoursTrend(organizacionId);

    // Tareas completadas a tiempo
    const tareasATiempo = await this.calculateTasksOnTime(organizacionId);

    return {
      proyectos: {
        total,
        activos,
        completados,
        enPausa
      },
      voluntarios: {
        total: parseInt(voluntariosUnicos.total),
        activos: parseInt(voluntariosActivos.total),
        nuevosEsteMes: parseInt(nuevosVoluntarios.total),
        retencion: parseInt(voluntariosUnicos.total) > 0 
          ? Math.round((parseInt(voluntariosActivos.total) / parseInt(voluntariosUnicos.total)) * 100)
          : 0
      },
      horas: {
        totalRegistradas: Math.round(parseFloat(horasStats.totalRegistradas || '0') * 100) / 100,
        totalVerificadas: Math.round(parseFloat(horasStats.totalVerificadas || '0') * 100) / 100,
        promedioSemanal: Math.round(parseFloat(horasSemanales.promedio || '0') * 100) / 100,
        tendencia: tendenciaHoras
      },
      rendimiento: {
        tareasCompletadasATiempo: tareasATiempo,
        satisfaccionVoluntarios: 85, // Placeholder - implementar encuestas
        eficienciaProyectos: Math.round((completados / (total || 1)) * 100)
      }
    };
  }

  /**
   * Obtiene analytics de un voluntario específico
   */
  async getVolunteerAnalytics(voluntarioId: number): Promise<VolunteerAnalytics> {
    // Proyectos participados
    const proyectosParticipados = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .leftJoin('tarea.fase', 'fase')
      .select('COUNT(DISTINCT fase.id_proyecto)', 'total')
      .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
      .getRawOne();

    // Tareas completadas
    const tareasCompletadas = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .select('COUNT(*)', 'total')
      .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
      .andWhere('tarea.id_estado = 3') // Completado
      .getRawOne();

    // Horas contribuidas
    const horasContribuidas = await this.horasRepo
      .createQueryBuilder('horas')
      .select('SUM(horas.horas_trabajadas)', 'total')
      .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
      .getRawOne();

    // Días activo (días únicos con registros de horas)
    const diasActivo = await this.horasRepo
      .createQueryBuilder('horas')
      .select('COUNT(DISTINCT DATE(horas.fecha))', 'total')
      .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
      .getRawOne();

    // Tareas a tiempo
    const tareasATiempoResult = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .select('COUNT(*)', 'total')
      .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
      .andWhere('tarea.id_estado = 3')
      .andWhere('tarea.actualizado_en <= tarea.fecha_fin')
      .getRawOne();

    const tareasATiempo = parseInt(tareasCompletadas.total) > 0
      ? Math.round((parseInt(tareasATiempoResult.total) / parseInt(tareasCompletadas.total)) * 100)
      : 0;

    // Horas por mes (últimos 12 meses)
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 12);

    const horasPorMes = await this.horasRepo
      .createQueryBuilder('horas')
      .select('YEAR(horas.fecha) as año, MONTH(horas.fecha) as mes, SUM(horas.horas_trabajadas) as total')
      .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
      .andWhere('horas.fecha >= :fechaInicio', { fechaInicio })
      .groupBy('YEAR(horas.fecha), MONTH(horas.fecha)')
      .orderBy('año, mes')
      .getRawMany();

    // Tareas completadas por mes
    const tareasCompletadasPorMes = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoin('asignacion.tarea', 'tarea')
      .select('YEAR(tarea.actualizado_en) as año, MONTH(tarea.actualizado_en) as mes, COUNT(*) as total')
      .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
      .andWhere('tarea.id_estado = 3')
      .andWhere('tarea.actualizado_en >= :fechaInicio', { fechaInicio })
      .groupBy('YEAR(tarea.actualizado_en), MONTH(tarea.actualizado_en)')
      .orderBy('año, mes')
      .getRawMany();

    return {
      actividad: {
        proyectosParticipados: parseInt(proyectosParticipados.total),
        tareasCompletadas: parseInt(tareasCompletadas.total),
        horasContribuidas: Math.round(parseFloat(horasContribuidas.total || '0') * 100) / 100,
        diasActivo: parseInt(diasActivo.total)
      },
      rendimiento: {
        tareasATiempo,
        calificacionPromedio: 4.2, // Placeholder - implementar sistema de calificaciones
        consistencia: this.calculateConsistency(horasPorMes)
      },
      progreso: {
        horasPorMes: horasPorMes.map(h => ({
          periodo: `${h.año}-${String(h.mes).padStart(2, '0')}`,
          total: parseFloat(h.total)
        })),
        tareasCompletadasPorMes: tareasCompletadasPorMes.map(t => ({
          periodo: `${t.año}-${String(t.mes).padStart(2, '0')}`,
          total: parseInt(t.total)
        })),
        habilidadesDesarrolladas: [] // Placeholder - implementar sistema de habilidades
      }
    };
  }

  /**
   * Calcula la eficiencia de horas
   */
  private async calculateHourEfficiency(): Promise<number> {
    // Placeholder - implementar lógica de eficiencia
    // Comparar horas estimadas vs horas reales
    return 85.5;
  }

  /**
   * Calcula la tendencia de horas
   */
  private async calculateHoursTrend(organizacionId: number): Promise<'subiendo' | 'bajando' | 'estable'> {
    const hace2Semanas = new Date();
    hace2Semanas.setDate(hace2Semanas.getDate() - 14);

    const hace1Semana = new Date();
    hace1Semana.setDate(hace1Semana.getDate() - 7);

    const [horasSemanaAnterior, horasSemanaActual] = await Promise.all([
      this.horasRepo
        .createQueryBuilder('horas')
        .leftJoin('horas.proyecto', 'proyecto')
        .select('SUM(horas.horas_trabajadas)', 'total')
        .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
        .andWhere('horas.fecha >= :hace2Semanas', { hace2Semanas })
        .andWhere('horas.fecha < :hace1Semana', { hace1Semana })
        .getRawOne(),
      
      this.horasRepo
        .createQueryBuilder('horas')
        .leftJoin('horas.proyecto', 'proyecto')
        .select('SUM(horas.horas_trabajadas)', 'total')
        .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
        .andWhere('horas.fecha >= :hace1Semana', { hace1Semana })
        .getRawOne()
    ]);

    const anterior = parseFloat(horasSemanaAnterior.total || '0');
    const actual = parseFloat(horasSemanaActual.total || '0');

    const diferencia = ((actual - anterior) / (anterior || 1)) * 100;

    if (diferencia > 5) return 'subiendo';
    if (diferencia < -5) return 'bajando';
    return 'estable';
  }

  /**
   * Calcula el porcentaje de tareas completadas a tiempo
   */
  private async calculateTasksOnTime(organizacionId: number): Promise<number> {
    const [totalCompletadas, completadasATiempo] = await Promise.all([
      this.tareaRepo
        .createQueryBuilder('tarea')
        .leftJoin('tarea.fase', 'fase')
        .leftJoin('fase.proyecto', 'proyecto')
        .select('COUNT(*)', 'total')
        .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
        .andWhere('tarea.id_estado = 3')
        .getRawOne(),
      
      this.tareaRepo
        .createQueryBuilder('tarea')
        .leftJoin('tarea.fase', 'fase')
        .leftJoin('fase.proyecto', 'proyecto')
        .select('COUNT(*)', 'total')
        .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
        .andWhere('tarea.id_estado = 3')
        .andWhere('tarea.actualizado_en <= tarea.fecha_fin')
        .getRawOne()
    ]);

    const total = parseInt(totalCompletadas.total);
    const aTiempo = parseInt(completadasATiempo.total);

    return total > 0 ? Math.round((aTiempo / total) * 100) : 0;
  }

  /**
   * Calcula la consistencia del voluntario
   */
  private calculateConsistency(horasPorMes: any[]): number {
    if (horasPorMes.length < 2) return 0;

    const valores = horasPorMes.map(h => parseFloat(h.total));
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    
    const varianza = valores.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / valores.length;
    const desviacion = Math.sqrt(varianza);
    
    // Consistencia como porcentaje inverso de la variabilidad
    const coeficienteVariacion = promedio > 0 ? (desviacion / promedio) : 1;
    return Math.max(0, Math.min(100, Math.round((1 - coeficienteVariacion) * 100)));
  }
}
