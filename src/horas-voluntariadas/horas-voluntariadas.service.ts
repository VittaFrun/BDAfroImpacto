import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorasVoluntariadas } from './horas-voluntariadas.entity';
import { CreateHorasVoluntariadasDto } from './create-horas-voluntariadas.dto';
import { UpdateHorasVoluntariadasDto } from './update-horas-voluntariadas.dto';
import { Usuario } from '../users/user.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Organizacion } from '../organizacion/organizacion.entity';

@Injectable()
export class HorasVoluntariadasService {
  constructor(
    @InjectRepository(HorasVoluntariadas)
    private readonly repo: Repository<HorasVoluntariadas>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
  ) {}

  async create(dto: CreateHorasVoluntariadasDto, user: Usuario) {
    // Validar que el usuario es voluntario
    if (user.tipo_usuario !== 'voluntario') {
      throw new ForbiddenException('Solo los voluntarios pueden registrar horas');
    }

    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    // Validar que el proyecto existe
    const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: dto.id_proyecto } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${dto.id_proyecto} no encontrado`);
    }

    // Validar que el voluntario está asignado al proyecto
    const asignacion = await this.asignacionRepo.findOne({
      where: { id_voluntario: voluntario.id_voluntario },
      relations: ['tarea', 'tarea.fase']
    });

    if (!asignacion) {
      // Verificar si hay alguna asignación en el proyecto
      const asignaciones = await this.asignacionRepo.find({
        where: { id_voluntario: voluntario.id_voluntario },
        relations: ['tarea', 'tarea.fase']
      });

      const tieneAsignacionEnProyecto = asignaciones.some(a => 
        a.tarea?.fase?.id_proyecto === dto.id_proyecto
      );

      if (!tieneAsignacionEnProyecto) {
        throw new ForbiddenException('No estás asignado a este proyecto');
      }
    } else {
      // Si hay id_tarea, validar que la tarea pertenece al proyecto
      if (dto.id_tarea) {
        const tarea = await this.tareaRepo.findOne({
          where: { id_tarea: dto.id_tarea },
          relations: ['fase']
        });

        if (!tarea) {
          throw new NotFoundException(`Tarea con ID ${dto.id_tarea} no encontrada`);
        }

        if (tarea.fase.id_proyecto !== dto.id_proyecto) {
          throw new BadRequestException('La tarea no pertenece al proyecto especificado');
        }

        // Validar que el voluntario está asignado a esta tarea
        const asignacionTarea = await this.asignacionRepo.findOne({
          where: {
            id_voluntario: voluntario.id_voluntario,
            id_tarea: dto.id_tarea
          }
        });

        if (!asignacionTarea) {
          throw new ForbiddenException('No estás asignado a esta tarea');
        }
      }
    }

    // Validar límites de horas
    const fechaRegistro = new Date(dto.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaRegistro.setHours(0, 0, 0, 0);

    // Validar que la fecha no sea futura
    if (fechaRegistro > hoy) {
      throw new BadRequestException('No se pueden registrar horas para fechas futuras');
    }

    // Validar que las horas sean positivas
    if (dto.horas_trabajadas <= 0) {
      throw new BadRequestException('Las horas trabajadas deben ser mayores a 0');
    }

    // Validar que las horas no excedan 24 horas por día
    if (dto.horas_trabajadas > 24) {
      throw new BadRequestException('No se pueden registrar más de 24 horas en un día');
    }

    // Validar límite razonable (máximo 12 horas por día recomendado, pero permitir hasta 16 con advertencia)
    if (dto.horas_trabajadas > 16) {
      throw new BadRequestException(
        'Se recomienda un máximo de 16 horas por día por razones de seguridad. Si necesitas registrar más, contacta a la organización.'
      );
    }

    // Advertencia para horas entre 12 y 16 (permitir pero advertir)
    if (dto.horas_trabajadas > 12 && dto.horas_trabajadas <= 16) {
      // Esto se puede manejar con un warning en el frontend, aquí solo validamos
    }

    // Validar límite de horas por día para el voluntario en esta fecha
    const horasDelDia = await this.repo.find({
      where: {
        id_voluntario: voluntario.id_voluntario,
        fecha: fechaRegistro
      }
    });

    const totalHorasDelDia = horasDelDia.reduce(
      (sum, h) => sum + parseFloat(h.horas_trabajadas.toString()),
      0
    );

    const nuevoTotal = totalHorasDelDia + dto.horas_trabajadas;
    
    if (nuevoTotal > 24) {
      throw new BadRequestException(
        `Ya has registrado ${totalHorasDelDia.toFixed(2)} horas para esta fecha. El total (${nuevoTotal.toFixed(2)} horas) no puede exceder 24 horas por día.`
      );
    }

    // Advertencia si el total supera 16 horas
    if (nuevoTotal > 16) {
      // Se puede agregar un campo de advertencia en la respuesta, pero permitir el registro
    }

    const horas = this.repo.create({
      id_voluntario: voluntario.id_voluntario,
      id_proyecto: dto.id_proyecto,
      id_tarea: dto.id_tarea || null,
      fecha: fechaRegistro,
      horas_trabajadas: dto.horas_trabajadas,
      descripcion: dto.descripcion || null,
      verificada: false
    });

    return this.repo.save(horas);
  }

  async findAllByVolunteer(user: Usuario) {
    if (user.tipo_usuario !== 'voluntario') {
      throw new ForbiddenException('Solo los voluntarios pueden ver sus horas');
    }

    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    return this.repo.find({
      where: { id_voluntario: voluntario.id_voluntario },
      relations: ['proyecto', 'tarea', 'tarea.fase'],
      order: { fecha: 'DESC', creado_en: 'DESC' }
    });
  }

  async findByProject(idProyecto: number, user: Usuario) {
    if (user.tipo_usuario !== 'voluntario') {
      throw new ForbiddenException('Solo los voluntarios pueden ver sus horas');
    }

    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    // Validar que el voluntario está asignado al proyecto
    const asignaciones = await this.asignacionRepo.find({
      where: { id_voluntario: voluntario.id_voluntario },
      relations: ['tarea', 'tarea.fase']
    });

    const tieneAsignacionEnProyecto = asignaciones.some(a => 
      a.tarea?.fase?.id_proyecto === idProyecto
    );

    if (!tieneAsignacionEnProyecto) {
      throw new ForbiddenException('No estás asignado a este proyecto');
    }

    return this.repo.find({
      where: {
        id_voluntario: voluntario.id_voluntario,
        id_proyecto: idProyecto
      },
      relations: ['proyecto', 'tarea', 'tarea.fase'],
      order: { fecha: 'DESC', creado_en: 'DESC' }
    });
  }

  async getResumenByProject(idProyecto: number, user: Usuario) {
    if (user.tipo_usuario !== 'voluntario') {
      throw new ForbiddenException('Solo los voluntarios pueden ver sus horas');
    }

    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    const horas = await this.repo.find({
      where: {
        id_voluntario: voluntario.id_voluntario,
        id_proyecto: idProyecto
      }
    });

    const totalHoras = horas.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
    const horasVerificadas = horas.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
    const horasPendientes = horas.filter(h => !h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);

    return {
      totalHoras: parseFloat(totalHoras.toFixed(2)),
      horasVerificadas: parseFloat(horasVerificadas.toFixed(2)),
      horasPendientes: parseFloat(horasPendientes.toFixed(2)),
      totalRegistros: horas.length,
      registrosVerificados: horas.filter(h => h.verificada).length,
      registrosPendientes: horas.filter(h => !h.verificada).length
    };
  }

  async findAllByProjectForOrganization(idProyecto: number, user: Usuario) {
    // Validar que el usuario es organización y tiene acceso al proyecto
    if (user.tipo_usuario !== 'organizacion' && user.tipo_usuario !== 'admin') {
      throw new ForbiddenException('Solo las organizaciones pueden ver todas las horas del proyecto');
    }

    const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: idProyecto } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${idProyecto} no encontrado`);
    }

    if (user.tipo_usuario !== 'admin') {
      const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
      if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
        throw new ForbiddenException('No tienes permiso para ver las horas de este proyecto');
      }
    }

    return this.repo.find({
      where: { id_proyecto: idProyecto },
      relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase'],
      order: { fecha: 'DESC', creado_en: 'DESC' }
    });
  }

  async update(id: number, dto: UpdateHorasVoluntariadasDto, user: Usuario) {
    const horas = await this.repo.findOne({
      where: { id_horas: id },
      relations: ['voluntario']
    });

    if (!horas) {
      throw new NotFoundException(`Horas con ID ${id} no encontradas`);
    }

    // Solo el voluntario dueño puede actualizar (excepto verificación que es solo organización)
    if (user.tipo_usuario === 'voluntario') {
      const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
      if (!voluntario || horas.id_voluntario !== voluntario.id_voluntario) {
        throw new ForbiddenException('Solo puedes actualizar tus propias horas');
      }

      // Los voluntarios no pueden cambiar el estado de verificación
      if (dto.verificada !== undefined) {
        throw new ForbiddenException('No puedes cambiar el estado de verificación');
      }
    }

    // Si es organización, solo puede cambiar la verificación
    if (user.tipo_usuario === 'organizacion' || user.tipo_usuario === 'admin') {
      if (dto.verificada === undefined) {
        throw new BadRequestException('Las organizaciones solo pueden verificar horas');
      }

      const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: horas.id_proyecto } });
      if (user.tipo_usuario !== 'admin') {
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
          throw new ForbiddenException('No tienes permiso para verificar horas de este proyecto');
        }
      }

      // Solo actualizar verificación
      horas.verificada = dto.verificada;
      return this.repo.save(horas);
    }

    // Actualizar campos permitidos para voluntarios
    if (dto.fecha) horas.fecha = new Date(dto.fecha);
    if (dto.horas_trabajadas !== undefined) horas.horas_trabajadas = dto.horas_trabajadas;
    if (dto.descripcion !== undefined) horas.descripcion = dto.descripcion;
    if (dto.id_tarea !== undefined) horas.id_tarea = dto.id_tarea;

    return this.repo.save(horas);
  }

  async remove(id: number, user: Usuario) {
    const horas = await this.repo.findOne({
      where: { id_horas: id },
      relations: ['voluntario']
    });

    if (!horas) {
      throw new NotFoundException(`Horas con ID ${id} no encontradas`);
    }

    // Solo el voluntario dueño puede eliminar
    if (user.tipo_usuario !== 'voluntario') {
      throw new ForbiddenException('Solo los voluntarios pueden eliminar sus horas');
    }

    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!voluntario || horas.id_voluntario !== voluntario.id_voluntario) {
      throw new ForbiddenException('Solo puedes eliminar tus propias horas');
    }

    return this.repo.remove(horas);
  }

  async verificar(id: number, verificada: boolean, user: Usuario) {
    const horas = await this.repo.findOne({
      where: { id_horas: id },
      relations: ['proyecto']
    });

    if (!horas) {
      throw new NotFoundException(`Horas con ID ${id} no encontradas`);
    }

    if (user.tipo_usuario !== 'organizacion' && user.tipo_usuario !== 'admin') {
      throw new ForbiddenException('Solo las organizaciones pueden verificar horas');
    }

    const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: horas.id_proyecto } });
    if (user.tipo_usuario !== 'admin') {
      const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
      if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
        throw new ForbiddenException('No tienes permiso para verificar horas de este proyecto');
      }
    }

    horas.verificada = verificada;
    return this.repo.save(horas);
  }
}

