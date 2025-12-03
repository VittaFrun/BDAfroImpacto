import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Usuario } from '../users/user.entity';

export interface CrearNotificacionDto {
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo?: string;
  id_proyecto?: number;
  tipo_entidad?: string;
  id_entidad?: number;
  datos_adicionales?: any;
}

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Voluntario)
    private readonly volRepo: Repository<Voluntario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  /**
   * Crea una nueva notificación
   */
  async crear(dto: CrearNotificacionDto): Promise<Notificacion> {
    const notificacion = this.repo.create({
      ...dto,
      tipo: dto.tipo || 'info',
      leida: false,
    });

    return this.repo.save(notificacion);
  }

  /**
   * Crea múltiples notificaciones
   */
  async crearMultiples(dtos: CrearNotificacionDto[]): Promise<Notificacion[]> {
    const notificaciones = dtos.map(dto =>
      this.repo.create({
        ...dto,
        tipo: dto.tipo || 'info',
        leida: false,
      })
    );

    return this.repo.save(notificaciones);
  }

  /**
   * Obtiene las notificaciones de un usuario
   */
  async findByUsuario(id_usuario: number, soloNoLeidas: boolean = false) {
    const where: any = { id_usuario };
    if (soloNoLeidas) {
      where.leida = false;
    }

    return this.repo.find({
      where,
      relations: ['proyecto'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  /**
   * Marca una notificación como leída
   */
  async marcarComoLeida(id_notificacion: number, id_usuario: number) {
    const notificacion = await this.repo.findOne({
      where: { id_notificacion, id_usuario },
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    notificacion.leida = true;
    return this.repo.save(notificacion);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async marcarTodasComoLeidas(id_usuario: number) {
    await this.repo.update(
      { id_usuario, leida: false },
      { leida: true }
    );
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }

  /**
   * Elimina una notificación
   */
  async eliminar(id_notificacion: number, id_usuario: number) {
    return this.repo.delete({ id_notificacion, id_usuario });
  }

  /**
   * Obtiene el conteo de notificaciones no leídas
   */
  async contarNoLeidas(id_usuario: number) {
    return this.repo.count({
      where: { id_usuario, leida: false },
    });
  }

  /**
   * Notifica cambio de estado de proyecto
   */
  async notificarCambioEstadoProyecto(
    id_proyecto: number,
    id_organizacion: number,
    estadoAnterior: string,
    estadoNuevo: string,
    nombreProyecto: string
  ) {
    const organizacion = await this.orgRepo.findOne({
      where: { id_organizacion },
      relations: ['usuario']
    });

    if (organizacion?.usuario) {
      return this.crear({
        id_usuario: organizacion.usuario.id_usuario,
        titulo: 'Estado del Proyecto Actualizado',
        mensaje: `El estado del proyecto "${nombreProyecto}" ha cambiado de "${estadoAnterior}" a "${estadoNuevo}"`,
        tipo: 'info',
        id_proyecto,
        tipo_entidad: 'proyecto',
        id_entidad: id_proyecto,
        datos_adicionales: {
          estado_anterior: estadoAnterior,
          estado_nuevo: estadoNuevo
        }
      });
    }
  }

  /**
   * Notifica nueva asignación a voluntario
   */
  async notificarNuevaAsignacion(
    id_voluntario: number,
    id_proyecto: number,
    id_tarea: number,
    nombreTarea: string,
    nombreProyecto: string,
    nombreRol: string
  ) {
    const voluntario = await this.volRepo.findOne({
      where: { id_voluntario },
      relations: ['usuario']
    });

    if (voluntario?.usuario) {
      return this.crear({
        id_usuario: voluntario.usuario.id_usuario,
        titulo: 'Nueva Asignación',
        mensaje: `Has sido asignado a la tarea "${nombreTarea}" en el proyecto "${nombreProyecto}" con el rol "${nombreRol}"`,
        tipo: 'info',
        id_proyecto,
        tipo_entidad: 'asignacion',
        id_entidad: id_tarea,
        datos_adicionales: {
          id_tarea,
          nombre_rol: nombreRol
        }
      });
    }
  }

  /**
   * Notifica nuevo comentario en tarea
   */
  async notificarNuevoComentario(
    id_usuario_comentario: number,
    id_tarea: number,
    id_proyecto: number,
    nombreTarea: string,
    nombreAutor: string,
    esMencion: boolean = false
  ) {
    // Obtener todos los usuarios relacionados con la tarea (asignados, comentarios previos)
    const { Asignacion } = await import('../asignacion/asignacion.entity');
    const { Comentario } = await import('../comentario/comentario.entity');
    const { getRepository } = await import('typeorm');
    const asignacionRepo = getRepository(Asignacion);
    const comentarioRepo = getRepository(Comentario);

    // Obtener usuarios asignados a la tarea
    const asignaciones = await asignacionRepo.find({
      where: { id_tarea },
      relations: ['voluntario', 'voluntario.usuario']
    });

    // Obtener usuarios que han comentado en la tarea
    const comentarios = await comentarioRepo.find({
      where: { id_tarea },
      relations: ['usuario']
    });

    const usuariosNotificar = new Set<number>();

    // Agregar usuarios asignados
    asignaciones.forEach(a => {
      if (a.voluntario?.usuario?.id_usuario && a.voluntario.usuario.id_usuario !== id_usuario_comentario) {
        usuariosNotificar.add(a.voluntario.usuario.id_usuario);
      }
    });

    // Agregar usuarios que han comentado
    comentarios.forEach(c => {
      if (c.id_usuario && c.id_usuario !== id_usuario_comentario) {
        usuariosNotificar.add(c.id_usuario);
      }
    });

    // Crear notificaciones para todos los usuarios
    const notificaciones = Array.from(usuariosNotificar).map(id_usuario => ({
      id_usuario,
      titulo: esMencion ? 'Has sido mencionado' : 'Nuevo Comentario',
      mensaje: esMencion 
        ? `${nombreAutor} te ha mencionado en un comentario de la tarea "${nombreTarea}"`
        : `${nombreAutor} ha comentado en la tarea "${nombreTarea}"`,
      tipo: esMencion ? 'warning' : 'info',
      id_proyecto,
      tipo_entidad: 'comentario',
      id_entidad: id_tarea,
      datos_adicionales: {
        id_tarea,
        nombre_tarea: nombreTarea
      }
    }));

    if (notificaciones.length > 0) {
      return this.crearMultiples(notificaciones);
    }
  }

  /**
   * Notifica tarea próxima a vencer
   */
  async notificarTareaProximaVencer(
    id_voluntario: number,
    id_proyecto: number,
    id_tarea: number,
    nombreTarea: string,
    fechaFin: Date,
    diasRestantes: number
  ) {
    const voluntario = await this.volRepo.findOne({
      where: { id_voluntario },
      relations: ['usuario']
    });

    if (voluntario?.usuario) {
      return this.crear({
        id_usuario: voluntario.usuario.id_usuario,
        titulo: 'Tarea Próxima a Vencer',
        mensaje: `La tarea "${nombreTarea}" vence en ${diasRestantes} día(s). Fecha límite: ${fechaFin.toLocaleDateString()}`,
        tipo: diasRestantes <= 1 ? 'error' : 'warning',
        id_proyecto,
        tipo_entidad: 'tarea',
        id_entidad: id_tarea,
        datos_adicionales: {
          id_tarea,
          fecha_fin: fechaFin,
          dias_restantes: diasRestantes
        }
      });
    }
  }

  /**
   * Notifica tarea pendiente sin actividad
   */
  async notificarTareaPendiente(
    id_voluntario: number,
    id_proyecto: number,
    id_tarea: number,
    nombreTarea: string,
    diasSinActividad: number
  ) {
    const voluntario = await this.volRepo.findOne({
      where: { id_voluntario },
      relations: ['usuario']
    });

    if (voluntario?.usuario) {
      return this.crear({
        id_usuario: voluntario.usuario.id_usuario,
        titulo: 'Recordatorio de Tarea',
        mensaje: `La tarea "${nombreTarea}" está pendiente desde hace ${diasSinActividad} día(s). ¿Necesitas ayuda?`,
        tipo: 'info',
        id_proyecto,
        tipo_entidad: 'tarea',
        id_entidad: id_tarea,
        datos_adicionales: {
          id_tarea,
          dias_sin_actividad: diasSinActividad
        }
      });
    }
  }
}

