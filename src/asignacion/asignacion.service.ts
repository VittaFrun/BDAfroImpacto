import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignacion } from './asignacion.entity';
import { CreateAsignacionDto } from './create-asignacion.dto';
import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { EliminacionHistorialService } from '../eliminacion-historial/eliminacion-historial.service';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class AsignacionService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly repo: Repository<Asignacion>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    private readonly eliminacionHistorialService: EliminacionHistorialService,
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(dto: CreateAsignacionDto, user: Usuario) {
    const tarea = await this.tareaRepo.findOne({ 
      where: { id_tarea: dto.id_tarea }, 
      relations: ['fase', 'fase.proyecto'] 
    });
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${dto.id_tarea} no encontrada`);
    }

    const proyecto = await this.proyectoRepo.findOne({
      where: { id_proyecto: tarea.fase.id_proyecto },
      relations: ['organizacion']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto no encontrado`);
    }

    await this.checkOrganizacionOwnership(proyecto.id_proyecto, user);

    // Validar que el rol pertenece al proyecto
    await this.validateRolForProject(dto.id_rol, proyecto.id_proyecto);

    const asignacion = this.repo.create({
      id_tarea: dto.id_tarea,
      id_voluntario: dto.id_voluntario,
      id_rol: dto.id_rol
    });

    const saved = await this.repo.save(asignacion);
    
    // Retornar con relaciones
    const asignacionCompleta = await this.repo.findOne({
      where: { id_asignacion: saved.id_asignacion },
      relations: ['rol', 'voluntario', 'voluntario.usuario', 'tarea']
    });

    // Notificar al voluntario sobre la nueva asignación
    if (asignacionCompleta?.voluntario?.usuario && asignacionCompleta?.tarea && asignacionCompleta?.rol) {
      try {
        await this.notificacionService.notificarNuevaAsignacion(
          asignacionCompleta.voluntario.id_voluntario,
          proyecto.id_proyecto,
          asignacionCompleta.tarea.id_tarea,
          asignacionCompleta.tarea.descripcion || 'Tarea sin nombre',
          proyecto.nombre || 'Proyecto sin nombre',
          asignacionCompleta.rol.nombre || asignacionCompleta.rol.nombre || 'Rol sin nombre'
        );
      } catch (error) {
        // No fallar la asignación si la notificación falla
        console.error('Error al notificar nueva asignación:', error);
      }
    }
    
    return asignacionCompleta;
  }

  async validateRolForProject(id_rol: number, id_proyecto: number) {
    const rol = await this.rolRepo.findOne({ where: { id_rol } });
    
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id_rol} no encontrado`);
    }

    if (!rol.activo) {
      throw new BadRequestException('El rol no está activo');
    }

    const proyecto = await this.proyectoRepo.findOne({
      where: { id_proyecto },
      relations: ['organizacion']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    // El rol debe ser: de la organización del proyecto, o del proyecto mismo
    const isValid = 
      (rol.tipo_rol === 'organizacion' && rol.id_organizacion === proyecto.id_organizacion) ||
      (rol.tipo_rol === 'proyecto' && rol.id_proyecto === id_proyecto);

    if (!isValid) {
      throw new BadRequestException('El rol seleccionado no está disponible para este proyecto');
    }

    return true;
  }

  findAllByTarea(idTarea: number) {
    return this.repo.find({ 
      where: { id_tarea: idTarea },
      relations: ['rol', 'voluntario', 'tarea']
    });
  }

  async findTasksByVoluntario(id_usuario: number) {
    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }
    return this.repo.find({ 
      where: { id_voluntario: voluntario.id_voluntario }, 
      relations: ['tarea', 'rol'] 
    });
  }

  async findAsignacionesByProyecto(id_proyecto: number, id_usuario: number) {
    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    // Obtener todas las asignaciones del voluntario
    const asignaciones = await this.repo.find({
      where: { id_voluntario: voluntario.id_voluntario },
      relations: ['tarea', 'tarea.fase', 'tarea.estado', 'rol']
    });

    // Filtrar solo las que pertenecen al proyecto
    const asignacionesProyecto = asignaciones.filter(a => 
      a.tarea?.fase?.id_proyecto === id_proyecto
    );

    return asignacionesProyecto;
  }

  async remove(id: number, user: Usuario) {
    const asignacion = await this.repo.findOne({ 
      where: { id_asignacion: id }, 
      relations: ['tarea', 'tarea.fase', 'rol', 'voluntario'] 
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignacion con ID ${id} no encontrada`);
    }
    await this.checkOrganizacionOwnership(asignacion.tarea.fase.id_proyecto, user);
    
    // Registrar en historial antes de eliminar
    try {
      await this.eliminacionHistorialService.registrarEliminacion({
        tipo_entidad: 'asignacion',
        id_entidad: id,
        nombre_entidad: `Asignación de ${asignacion.voluntario?.usuario?.nombre || 'voluntario'} a ${asignacion.tarea?.descripcion || 'tarea'}`,
        descripcion: `Asignación eliminada: ${asignacion.rol?.nombre || 'Rol'} en tarea "${asignacion.tarea?.descripcion || 'Tarea desconocida'}"`,
        id_proyecto: asignacion.tarea.fase.id_proyecto,
        datos_adicionales: {
          id_voluntario: asignacion.id_voluntario,
          id_tarea: asignacion.id_tarea,
          id_rol: asignacion.id_rol,
          voluntario_nombre: asignacion.voluntario?.usuario?.nombre,
          tarea_nombre: asignacion.tarea?.descripcion,
          rol_nombre: asignacion.rol?.nombre,
        },
      }, user);
    } catch (error) {
      console.error('Error al registrar eliminación en historial:', error);
    }

    // Notificar al voluntario sobre la eliminación de su asignación
    try {
      if (asignacion.voluntario?.id_usuario) {
        await this.notificacionService.crear({
          id_usuario: asignacion.voluntario.id_usuario,
          titulo: 'Asignación Eliminada',
          mensaje: `Tu asignación como "${asignacion.rol?.nombre || 'Rol'}" en la tarea "${asignacion.tarea?.descripcion || 'Tarea'}" ha sido eliminada del proyecto.`,
          tipo: 'warning',
          id_proyecto: asignacion.tarea.fase.id_proyecto,
          tipo_entidad: 'asignacion',
          id_entidad: id,
          datos_adicionales: {
            id_voluntario: asignacion.id_voluntario,
            id_tarea: asignacion.id_tarea,
            id_rol: asignacion.id_rol,
            tarea_nombre: asignacion.tarea?.descripcion,
            rol_nombre: asignacion.rol?.nombre,
          },
        });
      }
    } catch (error) {
      console.error('Error al crear notificación:', error);
    }
    
    return this.repo.remove(asignacion);
  }

  /**
   * Verifica si un voluntario tiene asignaciones activas en un proyecto
   * @param id_voluntario ID del voluntario
   * @param id_proyecto ID del proyecto (opcional, si no se proporciona verifica en todos los proyectos)
   * @returns Array de asignaciones con detalles de tareas
   */
  async getVolunteerAssignments(id_voluntario: number, id_proyecto?: number) {
    const query = this.repo
      .createQueryBuilder('asignacion')
      .innerJoinAndSelect('asignacion.tarea', 'tarea')
      .innerJoinAndSelect('tarea.fase', 'fase')
      .innerJoinAndSelect('tarea.estado', 'estado')
      .innerJoinAndSelect('asignacion.rol', 'rol')
      .where('asignacion.id_voluntario = :id_voluntario', { id_voluntario });

    if (id_proyecto) {
      query.andWhere('fase.id_proyecto = :id_proyecto', { id_proyecto });
    }

    return query.getMany();
  }

  /**
   * Verifica si un voluntario tiene asignaciones activas en un proyecto específico
   * @param id_voluntario ID del voluntario
   * @param id_proyecto ID del proyecto
   * @returns Objeto con información de las asignaciones
   */
  async checkVolunteerAssignmentsInProject(id_voluntario: number, id_proyecto: number) {
    const asignaciones = await this.getVolunteerAssignments(id_voluntario, id_proyecto);
    
    return {
      hasAssignments: asignaciones.length > 0,
      count: asignaciones.length,
      assignments: asignaciones.map(a => ({
        id_asignacion: a.id_asignacion,
        tarea: {
          id_tarea: a.tarea.id_tarea,
          nombre: a.tarea.descripcion,
          estado: a.tarea.estado?.nombre || 'Sin estado'
        },
        rol: {
          id_rol: a.rol.id_rol,
          nombre: a.rol.nombre
        }
      }))
    };
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
