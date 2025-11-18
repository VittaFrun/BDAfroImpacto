import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EliminacionHistorial } from './eliminacion-historial.entity';
import { Usuario } from '../users/user.entity';

export interface RegistroEliminacionDto {
  tipo_entidad: string;
  id_entidad: number;
  nombre_entidad?: string;
  descripcion?: string;
  id_proyecto?: number;
  razon?: string;
  datos_adicionales?: any;
}

@Injectable()
export class EliminacionHistorialService {
  constructor(
    @InjectRepository(EliminacionHistorial)
    private readonly repo: Repository<EliminacionHistorial>,
  ) {}

  /**
   * Registra una eliminación en el historial
   */
  async registrarEliminacion(
    dto: RegistroEliminacionDto,
    usuario: Usuario
  ): Promise<EliminacionHistorial> {
    const registro = this.repo.create({
      ...dto,
      id_usuario_eliminador: usuario.id_usuario,
    });

    return this.repo.save(registro);
  }

  /**
   * Obtiene el historial de eliminaciones de un proyecto
   */
  async findByProyecto(id_proyecto: number) {
    return this.repo.find({
      where: { id_proyecto },
      relations: ['usuario_eliminador', 'proyecto'],
      order: { fecha_eliminacion: 'DESC' },
    });
  }

  /**
   * Obtiene el historial de eliminaciones de un usuario
   */
  async findByUsuario(id_usuario: number) {
    return this.repo.find({
      where: { id_usuario_eliminador: id_usuario },
      relations: ['usuario_eliminador', 'proyecto'],
      order: { fecha_eliminacion: 'DESC' },
    });
  }

  /**
   * Obtiene el historial de eliminaciones por tipo de entidad
   */
  async findByTipoEntidad(tipo_entidad: string, id_proyecto?: number) {
    const where: any = { tipo_entidad };
    if (id_proyecto) {
      where.id_proyecto = id_proyecto;
    }

    return this.repo.find({
      where,
      relations: ['usuario_eliminador', 'proyecto'],
      order: { fecha_eliminacion: 'DESC' },
    });
  }

  /**
   * Obtiene todas las eliminaciones recientes (últimos 30 días)
   */
  async findRecent(id_proyecto?: number) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const where: any = {
      fecha_eliminacion: { $gte: fechaLimite } as any,
    };
    if (id_proyecto) {
      where.id_proyecto = id_proyecto;
    }

    return this.repo
      .createQueryBuilder('eliminacion')
      .where('eliminacion.fecha_eliminacion >= :fechaLimite', { fechaLimite })
      .andWhere(id_proyecto ? 'eliminacion.id_proyecto = :id_proyecto' : '1=1', { id_proyecto })
      .leftJoinAndSelect('eliminacion.usuario_eliminador', 'usuario')
      .leftJoinAndSelect('eliminacion.proyecto', 'proyecto')
      .orderBy('eliminacion.fecha_eliminacion', 'DESC')
      .getMany();
  }
}

