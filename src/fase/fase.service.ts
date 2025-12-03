import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fase } from './fase.entity';
import { CreateFaseDto } from './create-fase.dto';
import { UpdateFaseDto } from './update-fase.dto';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';

@Injectable()
export class FaseService {
  constructor(
    @InjectRepository(Fase)
    private readonly repo: Repository<Fase>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
  ) {}

  async create(dto: CreateFaseDto) {
    // Validar que el proyecto existe
    const proyecto = await this.proyectoRepo.findOne({ 
      where: { id_proyecto: dto.id_proyecto } 
    });
    
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${dto.id_proyecto} no encontrado`);
    }

    // Si no se proporciona orden, calcular automáticamente
    let ordenFinal = dto.orden;
    if (!ordenFinal) {
      const maxOrden = await this.repo
        .createQueryBuilder('fase')
        .where('fase.id_proyecto = :id_proyecto', { id_proyecto: dto.id_proyecto })
        .select('MAX(fase.orden)', 'max')
        .getRawOne();
      
      ordenFinal = (maxOrden?.max || 0) + 1;
    }

    // Validar orden único dentro del proyecto
    const existingFase = await this.repo.findOne({
      where: {
        id_proyecto: dto.id_proyecto,
        orden: ordenFinal
      }
    });

    if (existingFase) {
      throw new ConflictException(
        `Ya existe una fase con orden ${ordenFinal} en este proyecto. El siguiente orden disponible es ${ordenFinal + 1}`
      );
    }

    // Validar fechas si se proporcionan
    if (dto.fecha_inicio && dto.fecha_fin) {
      const fechaInicio = new Date(dto.fecha_inicio);
      const fechaFin = new Date(dto.fecha_fin);
      const proyectoInicio = new Date(proyecto.fecha_inicio);
      const proyectoFin = new Date(proyecto.fecha_fin);

      // Normalizar fechas (solo comparar fechas, no horas)
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(0, 0, 0, 0);
      proyectoInicio.setHours(0, 0, 0, 0);
      proyectoFin.setHours(0, 0, 0, 0);

      if (fechaInicio < proyectoInicio) {
        throw new BadRequestException(
          `La fecha de inicio de la fase (${dto.fecha_inicio}) no puede ser anterior al inicio del proyecto (${proyecto.fecha_inicio})`
        );
      }

      if (fechaFin > proyectoFin) {
        throw new BadRequestException(
          `La fecha de fin de la fase (${dto.fecha_fin}) no puede ser posterior al fin del proyecto (${proyecto.fecha_fin})`
        );
      }

      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior o igual a la fecha de fin'
        );
      }

      // Validar solapamiento con otras fases del mismo proyecto
      const fasesExistentes = await this.repo.find({
        where: { id_proyecto: dto.id_proyecto },
        select: ['id_fase', 'nombre', 'fecha_inicio', 'fecha_fin']
      });

      for (const faseExistente of fasesExistentes) {
        if (faseExistente.fecha_inicio && faseExistente.fecha_fin) {
          const existenteInicio = new Date(faseExistente.fecha_inicio);
          const existenteFin = new Date(faseExistente.fecha_fin);
          existenteInicio.setHours(0, 0, 0, 0);
          existenteFin.setHours(0, 0, 0, 0);

          // Verificar solapamiento
          if ((fechaInicio <= existenteFin && fechaFin >= existenteInicio)) {
            throw new ConflictException(
              `Las fechas de la fase se solapan con la fase "${faseExistente.nombre}" (${faseExistente.fecha_inicio} - ${faseExistente.fecha_fin})`
            );
          }
        }
      }
    }

    const fase = this.repo.create({
      ...dto,
      orden: ordenFinal
    });
    
    return this.repo.save(fase);
  }

  findAll() {
    return this.repo.find({
      relations: ['proyecto', 'tareas'],
      order: { orden: 'ASC' }
    });
  }

  async findOne(id: number) {
    const fase = await this.repo.findOne({ 
      where: { id_fase: id },
      relations: ['proyecto', 'tareas']
    });
    
    if (!fase) {
      throw new NotFoundException(`Fase con ID ${id} no encontrada`);
    }
    
    return fase;
  }

  async update(id: number, dto: UpdateFaseDto) {
    const fase = await this.findOne(id);

    // Validar orden único si se está cambiando
    if (dto.orden !== undefined && dto.orden !== fase.orden) {
      const existingFase = await this.repo.findOne({
        where: {
          id_proyecto: fase.id_proyecto,
          orden: dto.orden
        }
      });

      if (existingFase && existingFase.id_fase !== id) {
        throw new ConflictException(
          `Ya existe una fase con orden ${dto.orden} en este proyecto`
        );
      }
    }

    // Validar fechas si se proporcionan
    const fechaInicio = dto.fecha_inicio ? new Date(dto.fecha_inicio) : (fase.fecha_inicio ? new Date(fase.fecha_inicio) : null);
    const fechaFin = dto.fecha_fin ? new Date(dto.fecha_fin) : (fase.fecha_fin ? new Date(fase.fecha_fin) : null);

    if (fechaInicio || fechaFin) {
      const proyecto = await this.proyectoRepo.findOne({
        where: { id_proyecto: fase.id_proyecto }
      });

      if (!proyecto) {
        throw new NotFoundException('Proyecto asociado no encontrado');
      }

      // Si se proporciona una fecha, la otra debe existir también
      if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
        throw new BadRequestException(
          'Debe proporcionar tanto fecha de inicio como fecha de fin, o ninguna'
        );
      }

      if (fechaInicio && fechaFin) {
        // Normalizar fechas
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);
        const proyectoInicio = new Date(proyecto.fecha_inicio);
        const proyectoFin = new Date(proyecto.fecha_fin);
        proyectoInicio.setHours(0, 0, 0, 0);
        proyectoFin.setHours(0, 0, 0, 0);

        if (fechaInicio < proyectoInicio) {
          throw new BadRequestException(
            `La fecha de inicio de la fase no puede ser anterior al inicio del proyecto (${proyecto.fecha_inicio})`
          );
        }

        if (fechaFin > proyectoFin) {
          throw new BadRequestException(
            `La fecha de fin de la fase no puede ser posterior al fin del proyecto (${proyecto.fecha_fin})`
          );
        }

        if (fechaInicio > fechaFin) {
          throw new BadRequestException(
            'La fecha de inicio debe ser anterior o igual a la fecha de fin'
          );
        }

        // Validar solapamiento con otras fases (excluyendo la fase actual)
        const fasesExistentes = await this.repo.find({
          where: { id_proyecto: fase.id_proyecto },
          select: ['id_fase', 'nombre', 'fecha_inicio', 'fecha_fin']
        });

        for (const faseExistente of fasesExistentes) {
          if (faseExistente.id_fase === id) continue; // Saltar la fase actual
          
          if (faseExistente.fecha_inicio && faseExistente.fecha_fin) {
            const existenteInicio = new Date(faseExistente.fecha_inicio);
            const existenteFin = new Date(faseExistente.fecha_fin);
            existenteInicio.setHours(0, 0, 0, 0);
            existenteFin.setHours(0, 0, 0, 0);

            // Verificar solapamiento
            if ((fechaInicio <= existenteFin && fechaFin >= existenteInicio)) {
              throw new ConflictException(
                `Las fechas de la fase se solapan con la fase "${faseExistente.nombre}" (${faseExistente.fecha_inicio} - ${faseExistente.fecha_fin})`
              );
            }
          }
        }

        // Validar que las tareas existentes estén dentro del nuevo rango de fechas
        const tareas = await this.tareaRepo.find({
          where: { id_fase: id },
          select: ['id_tarea', 'descripcion', 'fecha_inicio', 'fecha_fin']
        });

        for (const tarea of tareas) {
          const tareaInicio = new Date(tarea.fecha_inicio);
          const tareaFin = new Date(tarea.fecha_fin);
          tareaInicio.setHours(0, 0, 0, 0);
          tareaFin.setHours(0, 0, 0, 0);

          if (tareaInicio < fechaInicio || tareaFin > fechaFin) {
            throw new BadRequestException(
              `No se puede actualizar la fase porque la tarea "${tarea.descripcion.substring(0, 50)}..." tiene fechas fuera del nuevo rango de la fase`
            );
          }
        }
      }
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const fase = await this.findOne(id);

    // Validar que no tenga tareas asignadas
    const tareas = await this.tareaRepo.find({
      where: { id_fase: id },
      select: ['id_tarea', 'descripcion']
    });

    if (tareas.length > 0) {
      const tareasList = tareas.slice(0, 5).map(t => `"${t.descripcion.substring(0, 30)}..."`).join(', ');
      const mensaje = tareas.length > 5 
        ? `${tareasList} y ${tareas.length - 5} más`
        : tareasList;
      
      throw new ConflictException(
        `No se puede eliminar la fase porque tiene ${tareas.length} tarea(s) asignada(s): ${mensaje}. Elimine las tareas primero.`
      );
    }

    return this.repo.delete(id);
  }

  /**
   * Obtiene todas las fases de un proyecto ordenadas por orden
   */
  async findByProject(projectId: number) {
    return this.repo.find({
      where: { id_proyecto: projectId },
      relations: ['tareas'],
      order: { orden: 'ASC' }
    });
  }

  /**
   * Reordena las fases de un proyecto
   */
  async reorderPhases(projectId: number, newOrder: { id_fase: number; orden: number }[]) {
    // Validar que todas las fases pertenezcan al proyecto
    const fasesIds = newOrder.map(item => item.id_fase);
    const fases = await this.repo.find({
      where: { id_proyecto: projectId }
    });

    const fasesIdsExistentes = fases.map(f => f.id_fase);
    const fasesInvalidas = fasesIds.filter(id => !fasesIdsExistentes.includes(id));

    if (fasesInvalidas.length > 0) {
      throw new BadRequestException(
        `Las siguientes fases no pertenecen a este proyecto: ${fasesInvalidas.join(', ')}`
      );
    }

    // Validar que no haya órdenes duplicados
    const ordenes = newOrder.map(item => item.orden);
    const ordenesUnicos = new Set(ordenes);
    if (ordenes.length !== ordenesUnicos.size) {
      throw new BadRequestException('No puede haber órdenes duplicados');
    }

    // Actualizar órdenes
    const updates = newOrder.map(item =>
      this.repo.update(item.id_fase, { orden: item.orden })
    );

    await Promise.all(updates);
    return this.findByProject(projectId);
  }
}
