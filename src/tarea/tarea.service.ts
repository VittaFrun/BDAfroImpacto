import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './tarea.entity';
import { CreateTareaDto } from './create-tarea.dto';
import { UpdateTareaDto } from './update-tarea.dto';
import { Usuario } from '../users/user.entity';
import { Fase } from '../fase/fase.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea)
    private readonly repo: Repository<Tarea>,
    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(HorasVoluntariadas)
    private readonly horasRepo: Repository<HorasVoluntariadas>,
  ) {}

  async create(dto: CreateTareaDto, user: Usuario) {
    const fase = await this.faseRepo.findOne({ 
      where: { id_fase: dto.id_fase },
      relations: ['proyecto']
    });
    if (!fase) {
      throw new NotFoundException(`Fase con ID ${dto.id_fase} no encontrada`);
    }
    await this.checkOrganizacionOwnership(fase.id_proyecto, user);

    // Validar fechas (requeridas)
    if (!dto.fecha_inicio || !dto.fecha_fin) {
      throw new BadRequestException('Las fechas de inicio y fin son requeridas para la tarea');
    }

    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);
    
    // Normalizar fechas (solo comparar fechas, no horas)
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior o igual a la fecha de fin'
      );
    }

    // Validar que las fechas estén dentro del rango de la fase (si tiene fechas)
    if (fase.fecha_inicio && fase.fecha_fin) {
      const faseInicio = new Date(fase.fecha_inicio);
      const faseFin = new Date(fase.fecha_fin);
      faseInicio.setHours(0, 0, 0, 0);
      faseFin.setHours(0, 0, 0, 0);

      if (fechaInicio < faseInicio) {
        throw new BadRequestException(
          `La fecha de inicio de la tarea (${dto.fecha_inicio}) no puede ser anterior al inicio de la fase (${fase.fecha_inicio})`
        );
      }
      if (fechaFin > faseFin) {
        throw new BadRequestException(
          `La fecha de fin de la tarea (${dto.fecha_fin}) no puede ser posterior al fin de la fase (${fase.fecha_fin})`
        );
      }
    }

    // Validar que las fechas estén dentro del rango del proyecto
    if (fase.proyecto) {
      const proyectoInicio = new Date(fase.proyecto.fecha_inicio);
      const proyectoFin = new Date(fase.proyecto.fecha_fin);
      proyectoInicio.setHours(0, 0, 0, 0);
      proyectoFin.setHours(0, 0, 0, 0);

      if (fechaInicio < proyectoInicio) {
        throw new BadRequestException(
          `La fecha de inicio de la tarea (${dto.fecha_inicio}) no puede ser anterior al inicio del proyecto (${fase.proyecto.fecha_inicio})`
        );
      }
      if (fechaFin > proyectoFin) {
        throw new BadRequestException(
          `La fecha de fin de la tarea (${dto.fecha_fin}) no puede ser posterior al fin del proyecto (${fase.proyecto.fecha_fin})`
        );
      }
    }

    const tarea = this.repo.create(dto);
    return this.repo.save(tarea);
  }

  findAllByProyecto(idProyecto: number) {
    return this.repo.createQueryBuilder('tarea')
      .innerJoin('tarea.fase', 'fase')
      .where('fase.id_proyecto = :idProyecto', { idProyecto })
      .getMany();
  }

  async findOne(id: number) {
    return this.repo.findOne({ 
      where: { id_tarea: id },
      relations: ['fase', 'fase.proyecto']
    });
  }

  async update(id: number, dto: UpdateTareaDto, user: Usuario) {
    const tarea = await this.repo.findOne({ 
      where: { id_tarea: id },
      relations: ['fase', 'fase.proyecto']
    });
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    if (user.tipo_usuario === 'organizacion') {
      await this.checkOrganizacionOwnership(tarea.fase.id_proyecto, user);
    } else if (user.tipo_usuario === 'voluntario') {
      const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
      if (!voluntario) {
        throw new NotFoundException('Voluntario no encontrado');
      }
      const asignacion = await this.asignacionRepo.findOne({ where: { id_tarea: id, id_voluntario: voluntario.id_voluntario } });
      if (!asignacion) {
        throw new ForbiddenException('No tienes permiso para actualizar esta tarea.');
      }
      // Opcional: solo permitir actualizar ciertos campos
      if (dto.id_estado) {
        const { id_estado } = dto;
        return this.repo.update(id, { id_estado });
      }
      throw new ForbiddenException('Como voluntario, solo puedes actualizar el estado de la tarea.');

    } else if (user.tipo_usuario !== 'admin') {
        throw new ForbiddenException('No tienes permiso para actualizar esta tarea.');
    }

    // Validar fechas si se están actualizando
    if (dto.fecha_inicio || dto.fecha_fin) {
      const fechaInicio = dto.fecha_inicio 
        ? new Date(dto.fecha_inicio) 
        : (tarea.fecha_inicio ? new Date(tarea.fecha_inicio) : null);
      const fechaFin = dto.fecha_fin 
        ? new Date(dto.fecha_fin) 
        : (tarea.fecha_fin ? new Date(tarea.fecha_fin) : null);

      if (!fechaInicio || !fechaFin) {
        throw new BadRequestException('Ambas fechas (inicio y fin) son requeridas');
      }

      // Normalizar fechas
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(0, 0, 0, 0);

      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior o igual a la fecha de fin'
        );
      }

      // Validar que las fechas estén dentro del rango de la fase
      if (tarea.fase.fecha_inicio && tarea.fase.fecha_fin) {
        const faseInicio = new Date(tarea.fase.fecha_inicio);
        const faseFin = new Date(tarea.fase.fecha_fin);
        faseInicio.setHours(0, 0, 0, 0);
        faseFin.setHours(0, 0, 0, 0);

        if (fechaInicio < faseInicio) {
          throw new BadRequestException(
            `La fecha de inicio de la tarea no puede ser anterior al inicio de la fase (${tarea.fase.fecha_inicio})`
          );
        }
        if (fechaFin > faseFin) {
          throw new BadRequestException(
            `La fecha de fin de la tarea no puede ser posterior al fin de la fase (${tarea.fase.fecha_fin})`
          );
        }
      }

      // Validar que las fechas estén dentro del rango del proyecto
      if (tarea.fase.proyecto) {
        const proyectoInicio = new Date(tarea.fase.proyecto.fecha_inicio);
        const proyectoFin = new Date(tarea.fase.proyecto.fecha_fin);
        proyectoInicio.setHours(0, 0, 0, 0);
        proyectoFin.setHours(0, 0, 0, 0);

        if (fechaInicio < proyectoInicio) {
          throw new BadRequestException(
            `La fecha de inicio de la tarea no puede ser anterior al inicio del proyecto (${tarea.fase.proyecto.fecha_inicio})`
          );
        }
        if (fechaFin > proyectoFin) {
          throw new BadRequestException(
            `La fecha de fin de la tarea no puede ser posterior al fin del proyecto (${tarea.fase.proyecto.fecha_fin})`
          );
        }
      }
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, user: Usuario) {
    const tarea = await this.findOne(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    await this.checkOrganizacionOwnership(tarea.fase.id_proyecto, user);
    
    // Validar que no tenga asignaciones activas
    const asignaciones = await this.asignacionRepo.find({
      where: { id_tarea: id }
    });
    
    if (asignaciones.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la tarea porque tiene ${asignaciones.length} asignación(es) activa(s). Por favor, elimina primero todas las asignaciones.`
      );
    }
    
    // Validar que no tenga horas voluntariadas registradas
    const horasVoluntariadas = await this.horasRepo.find({
      where: { id_tarea: id }
    });
    
    if (horasVoluntariadas.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la tarea porque tiene ${horasVoluntariadas.length} registro(s) de horas voluntariadas. Por favor, elimina primero todos los registros de horas.`
      );
    }
    
    return this.repo.remove(tarea);
  }

  private async checkOrganizacionOwnership(id_proyecto: number, user: Usuario) {
    if (user.tipo_usuario === 'admin') return;

    const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso sobre este proyecto.');
    }
  }
}
