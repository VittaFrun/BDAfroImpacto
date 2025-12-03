import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Tarea } from '../tarea/tarea.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { NotificacionService } from './notificacion.service';

@Injectable()
export class RecordatoriosService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    private readonly notificacionService: NotificacionService,
  ) {}

  /**
   * Verifica tareas próximas a vencer y envía notificaciones
   * Se ejecuta diariamente a las 9:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async verificarTareasProximasAVencer() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar tareas que vencen en los próximos 3 días
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + 3);

    const tareas = await this.tareaRepo
      .createQueryBuilder('tarea')
      .innerJoin('tarea.fase', 'fase')
      .innerJoin('fase.proyecto', 'proyecto')
      .where('tarea.fecha_fin IS NOT NULL')
      .andWhere('tarea.fecha_fin >= :hoy', { hoy })
      .andWhere('tarea.fecha_fin <= :fechaLimite', { fechaLimite })
      .andWhere('tarea.id_estado NOT IN (:...estadosCompletados)', {
        estadosCompletados: [3, 4], // Completada, Cancelada
      })
      .getMany();

    for (const tarea of tareas) {
      // Obtener asignaciones de la tarea
      const asignaciones = await this.asignacionRepo.find({
        where: { id_tarea: tarea.id_tarea },
        relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase', 'tarea.fase.proyecto'],
      });

      if (tarea.fecha_fin) {
        const fechaFin = new Date(tarea.fecha_fin);
        const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        // Notificar a cada voluntario asignado
        for (const asignacion of asignaciones) {
          if (asignacion.voluntario?.usuario) {
            try {
              await this.notificacionService.notificarTareaProximaVencer(
                asignacion.voluntario.id_voluntario,
                asignacion.tarea.fase?.id_proyecto || null,
                tarea.id_tarea,
                tarea.descripcion || 'Tarea sin nombre',
                fechaFin,
                diasRestantes
              );
            } catch (error) {
              console.error(`Error al notificar tarea próxima a vencer para voluntario ${asignacion.voluntario.id_voluntario}:`, error);
            }
          }
        }
      }
    }
  }

  /**
   * Verifica tareas pendientes sin actividad y envía recordatorios
   * Se ejecuta diariamente a las 10:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async verificarTareasPendientes() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar tareas pendientes sin actividad en los últimos 7 días
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    const tareas = await this.tareaRepo
      .createQueryBuilder('tarea')
      .innerJoin('tarea.fase', 'fase')
      .innerJoin('fase.proyecto', 'proyecto')
      .where('tarea.id_estado IN (:...estadosPendientes)', {
        estadosPendientes: [1, 2], // Pendiente, En Progreso
      })
      .andWhere('(tarea.actualizado_en IS NULL OR tarea.actualizado_en < :fechaLimite)', {
        fechaLimite,
      })
      .getMany();

    for (const tarea of tareas) {
      // Obtener asignaciones de la tarea
      const asignaciones = await this.asignacionRepo.find({
        where: { id_tarea: tarea.id_tarea },
        relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase', 'tarea.fase.proyecto'],
      });

      const ultimaActualizacion = tarea.actualizado_en || tarea.creado_en || new Date();
      const diasSinActividad = Math.floor(
        (hoy.getTime() - new Date(ultimaActualizacion).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Solo notificar si han pasado al menos 7 días
      if (diasSinActividad >= 7) {
        // Notificar a cada voluntario asignado
        for (const asignacion of asignaciones) {
          if (asignacion.voluntario?.usuario) {
            try {
              await this.notificacionService.notificarTareaPendiente(
                asignacion.voluntario.id_voluntario,
                asignacion.tarea.fase?.id_proyecto || null,
                tarea.id_tarea,
                tarea.descripcion || 'Tarea sin nombre',
                diasSinActividad
              );
            } catch (error) {
              console.error(`Error al notificar tarea pendiente para voluntario ${asignacion.voluntario.id_voluntario}:`, error);
            }
          }
        }
      }
    }
  }
}

