import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';

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
}

