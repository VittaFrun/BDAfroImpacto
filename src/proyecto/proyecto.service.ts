import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from './proyecto.entity';
import { CreateProyectoDto } from './create-proyecto.dto';
import { UpdateProyectoDto } from './update-proyecto.dto';
import { Usuario } from '../users/user.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Fase } from '../fase/fase.entity';
import { Tarea } from '../tarea/tarea.entity';
import { CreateFaseDto } from '../fase/create-fase.dto';
import { CreateTareaDto } from '../tarea/create-tarea.dto';
import { ProyectoBeneficio } from '../proyecto-beneficio/proyecto-beneficio.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Estado } from '../estado/estado.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { SolicitudInscripcion } from '../solicitud-inscripcion/solicitud-inscripcion.entity';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly repo: Repository<Proyecto>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(ProyectoBeneficio)
    private readonly beneficioRepo: Repository<ProyectoBeneficio>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(HorasVoluntariadas)
    private readonly horasRepo: Repository<HorasVoluntariadas>,
    @InjectRepository(Estado)
    private readonly estadoRepo: Repository<Estado>,
    @InjectRepository(SolicitudInscripcion)
    private readonly solicitudRepo: Repository<SolicitudInscripcion>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(dto: CreateProyectoDto, user: Usuario) {
    // Validar campos requeridos con BadRequestException
    if (!dto.nombre || dto.nombre.trim() === '') {
      throw new BadRequestException('El nombre del proyecto es requerido');
    }
    if (dto.nombre.trim().length < 3) {
      throw new BadRequestException('El nombre del proyecto debe tener al menos 3 caracteres');
    }
    if (dto.nombre.trim().length > 100) {
      throw new BadRequestException('El nombre del proyecto no puede exceder 100 caracteres');
    }

    if (!dto.descripcion || dto.descripcion.trim() === '') {
      throw new BadRequestException('La descripción del proyecto es requerida');
    }
    if (dto.descripcion.trim().length < 10) {
      throw new BadRequestException('La descripción del proyecto debe tener al menos 10 caracteres');
    }

    if (!dto.objetivo || dto.objetivo.trim() === '') {
      throw new BadRequestException('El objetivo del proyecto es requerido');
    }
    if (dto.objetivo.trim().length < 10) {
      throw new BadRequestException('El objetivo del proyecto debe tener al menos 10 caracteres');
    }

    if (!dto.ubicacion || dto.ubicacion.trim() === '') {
      throw new BadRequestException('La ubicación del proyecto es requerida');
    }

    if (!dto.fecha_inicio) {
      throw new BadRequestException('La fecha de inicio es requerida');
    }
    if (!dto.fecha_fin) {
      throw new BadRequestException('La fecha de fin es requerida');
    }

    // Validar fechas
    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaInicio > fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
    }

    // Validar que la fecha de inicio no sea muy antigua (más de 1 año)
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    unAnoAtras.setHours(0, 0, 0, 0);
    
    if (fechaInicio < unAnoAtras) {
      throw new BadRequestException('La fecha de inicio no puede ser anterior a hace un año');
    }

    // Validar presupuesto si se proporciona
    if (dto.presupuesto_total !== undefined && dto.presupuesto_total !== null) {
      if (dto.presupuesto_total < 0) {
        throw new BadRequestException('El presupuesto no puede ser negativo');
      }
      if (dto.presupuesto_total > 999999999999.99) {
        throw new BadRequestException('El presupuesto excede el límite máximo permitido');
      }
    }

    // Validar imagen si se proporciona
    if (dto.imagen_principal) {
      this.validateImageUrl(dto.imagen_principal);
    }

    // Validar banner si se proporciona
    if (dto.banner) {
      this.validateImageUrl(dto.banner);
    }

    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
    if (!organizacion) {
      throw new NotFoundException('Organizacion no encontrada para el usuario');
    }
    
    // Validar que el estado existe, si no usar estado por defecto (1 = Activo)
    let id_estado = dto.id_estado || 1;
    if (id_estado === 0) {
      id_estado = 1;
    }

    // Verificar que el estado existe
    const estado = await this.estadoRepo.findOne({ where: { id_estado } });
    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id_estado} no encontrado`);
    }
    
    const proyecto = this.repo.create({ 
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion.trim(),
      objetivo: dto.objetivo.trim(),
      ubicacion: dto.ubicacion.trim(),
      fecha_inicio: dto.fecha_inicio,
      fecha_fin: dto.fecha_fin,
      imagen_principal: dto.imagen_principal || '/assets/images/background_login.png',
      banner: dto.banner || null,
      documento: dto.documento || null,
      presupuesto_total: dto.presupuesto_total || 0,
      categoria: dto.categoria || null,
      es_publico: dto.es_publico !== undefined ? dto.es_publico : true,
      requisitos: dto.requisitos || null,
      id_estado: id_estado,
      id_organizacion: organizacion.id_organizacion
    });
    
    return this.repo.save(proyecto);
  }

  /**
   * Valida que una URL de imagen sea válida
   */
  private validateImageUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('La URL de la imagen debe ser una cadena de texto válida');
    }

    // Validar formato de URL
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol.toLowerCase();
      
      // Permitir http, https y rutas relativas que empiecen con /
      if (protocol !== 'http:' && protocol !== 'https:' && !url.startsWith('/')) {
        throw new BadRequestException('La URL de la imagen debe ser una URL válida (http/https) o una ruta relativa');
      }

      // Validar extensión de archivo si es una URL completa
      if (protocol === 'http:' || protocol === 'https:') {
        const pathname = urlObj.pathname.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
        
        if (!hasValidExtension && !pathname.includes('data:image')) {
          // Permitir data URLs para imágenes base64
          if (!url.startsWith('data:image/')) {
            throw new BadRequestException(
              `La URL de la imagen debe tener una extensión válida (${validExtensions.join(', ')}) o ser una imagen base64`
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Si no es una URL válida pero es una ruta relativa, está bien
      if (!url.startsWith('/') && !url.startsWith('data:image/')) {
        throw new BadRequestException('La URL de la imagen no es válida');
      }
    }
  }

  // --- MÉTODO findAll() CORREGIDO ---
  async findAll(user: Usuario) {
    try {
    // Si el usuario es un admin, puede ver todos los proyectos
    if (user.tipo_usuario === 'admin') {
        const proyectos = await this.repo.find({ 
          relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'beneficio'],
          order: { creado_en: 'DESC' }
      });
        return proyectos || [];
    }

    // Si el usuario es una organización, busca solo sus proyectos
    if (user.tipo_usuario === 'organizacion') {
      const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

      if (!organizacion) {
        // Si no se encuentra una organización para este usuario, no devuelve proyectos.
        return [];
      }

        const proyectos = await this.repo.find({
        where: { id_organizacion: organizacion.id_organizacion },
        relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'beneficio'],
          order: { creado_en: 'DESC' }
      });
        return proyectos || [];
    }

    // Si es un voluntario, devolver los proyectos en los que participa
    if (user.tipo_usuario === 'voluntario') {
      return this.findProjectsByVoluntario(user.id_usuario);
    }
    return [];
    } catch (error) {
      console.error('Error en findAll proyectos:', error);
      // Si hay un error al cargar las relaciones, intentar cargar sin las tareas
      try {
        if (user.tipo_usuario === 'admin') {
          const proyectos = await this.repo.find({ 
            relations: ['organizacion', 'estado', 'fases'],
            order: { creado_en: 'DESC' }
          });
          // Cargar tareas manualmente
          for (const proyecto of proyectos) {
            if (proyecto.fases && proyecto.fases.length > 0) {
              for (const fase of proyecto.fases) {
                try {
                  fase.tareas = await this.tareaRepo.find({
                    where: { id_fase: fase.id_fase },
                  });
                } catch (tareaError) {
                  console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
                  fase.tareas = [];
                }
              }
            }
          }
          return proyectos || [];
        }
        if (user.tipo_usuario === 'organizacion') {
          const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
          if (organizacion) {
            const proyectos = await this.repo.find({
              where: { id_organizacion: organizacion.id_organizacion },
              relations: ['organizacion', 'estado', 'fases'],
              order: { creado_en: 'DESC' }
            });
            // Cargar tareas manualmente
            for (const proyecto of proyectos) {
              if (proyecto.fases && proyecto.fases.length > 0) {
                for (const fase of proyecto.fases) {
                  try {
                    fase.tareas = await this.tareaRepo.find({
                      where: { id_fase: fase.id_fase },
                    });
                  } catch (tareaError) {
                    console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
                    fase.tareas = [];
                  }
                }
              }
            }
            return proyectos || [];
          }
        }
      } catch (fallbackError) {
        console.error('Error en fallback findAll:', fallbackError);
      }
      // Retornar array vacío en caso de error para no romper el frontend
      return [];
    }
  }

  async findOne(id: number) {
    try {
    const proyecto = await this.repo.findOne({
      where: { id_proyecto: id },
      relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'fases.tareas.asignaciones', 'fases.tareas.asignaciones.rol', 'fases.tareas.asignaciones.voluntario', 'fases.tareas.asignaciones.voluntario.usuario', 'beneficio'],
    });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return proyecto;
    } catch (error) {
      // Si hay un error al cargar las relaciones (por ejemplo, columnas faltantes),
      // intentar cargar sin las tareas primero
      console.error('Error loading proyecto with relations:', error);
      const proyecto = await this.repo.findOne({
        where: { id_proyecto: id },
        relations: ['organizacion', 'estado', 'fases', 'beneficio'],
      });
      if (!proyecto) {
        throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
      }
      // Cargar tareas manualmente si es necesario
      if (proyecto.fases && proyecto.fases.length > 0) {
        for (const fase of proyecto.fases) {
          try {
            const tareas = await this.tareaRepo.find({
              where: { id_fase: fase.id_fase },
              relations: ['asignaciones', 'asignaciones.rol', 'asignaciones.voluntario', 'asignaciones.voluntario.usuario'],
            });
            fase.tareas = tareas || [];
          } catch (tareaError) {
            console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
            fase.tareas = [];
          }
        }
      }
      return proyecto;
    }
  }

  // Método para obtener proyectos públicos (sin autenticación)
  async findPublicProjects() {
    try {
      // Buscar proyectos públicos que estén en estados que permiten inscripción de voluntarios:
      // - id_estado: 1 = "activo"
      // - id_estado: 7 = "en_progreso"
      // - id_estado: 5 = "planificacion" (pueden estar abiertos a voluntarios)
      // - id_estado: 6 = "pendiente" (pueden estar abiertos a voluntarios)
      const proyectos = await this.repo.find({
        where: [
          {
            es_publico: true,
            id_estado: 1 // Estado activo
          },
          {
            es_publico: true,
            id_estado: 7 // Estado en_progreso
          },
          {
            es_publico: true,
            id_estado: 5 // Estado planificacion
          },
          {
            es_publico: true,
            id_estado: 6 // Estado pendiente
          }
        ],
        relations: ['organizacion', 'estado', 'beneficio'],
        order: { creado_en: 'DESC' }
      });
      return proyectos || [];
    } catch (error) {
      console.error('Error loading public projects:', error);
      // Si falla la búsqueda con estados específicos, intentar solo con es_publico
      try {
        const proyectos = await this.repo.find({
          where: {
            es_publico: true
          },
          relations: ['organizacion', 'estado', 'beneficio'],
          order: { creado_en: 'DESC' }
        });
        // Filtrar proyectos que no estén en estados terminales o inactivos
        return proyectos.filter(p => {
          const estadoNombre = p.estado?.nombre?.toLowerCase() || '';
          const estadoId = p.id_estado;
          // Excluir: inactivo (2), completado (3), cancelado (4), rechazada (9)
          return estadoId !== 2 && 
                 estadoId !== 3 && 
                 estadoId !== 4 && 
                 estadoId !== 9 &&
                 !estadoNombre.includes('cerrado');
        }) || [];
      } catch (fallbackError) {
        console.error('Error en fallback de findPublicProjects:', fallbackError);
        return [];
      }
    }
  }

  async update(id: number, dto: UpdateProyectoDto, user: Usuario) {
    const proyecto = await this.findOne(id);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para actualizar este proyecto.');
    }

    // Validar fechas si se están actualizando
    if (dto.fecha_inicio || dto.fecha_fin) {
      const nuevaFechaInicio = dto.fecha_inicio 
        ? (typeof dto.fecha_inicio === 'string' ? new Date(dto.fecha_inicio) : dto.fecha_inicio)
        : proyecto.fecha_inicio;
      const nuevaFechaFin = dto.fecha_fin 
        ? (typeof dto.fecha_fin === 'string' ? new Date(dto.fecha_fin) : dto.fecha_fin)
        : proyecto.fecha_fin;

      if (nuevaFechaInicio > nuevaFechaFin) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      // Validar que las fases existentes estén dentro del nuevo rango
      const fases = await this.faseRepo.find({
        where: { id_proyecto: id },
        relations: ['tareas']
      });

      for (const fase of fases) {
        if (fase.fecha_inicio && new Date(fase.fecha_inicio) < nuevaFechaInicio) {
          throw new BadRequestException(
            `La fase "${fase.nombre}" tiene una fecha de inicio (${fase.fecha_inicio}) anterior a la nueva fecha de inicio del proyecto`
          );
        }
        if (fase.fecha_fin && new Date(fase.fecha_fin) > nuevaFechaFin) {
          throw new BadRequestException(
            `La fase "${fase.nombre}" tiene una fecha de fin (${fase.fecha_fin}) posterior a la nueva fecha de fin del proyecto`
          );
        }

        // Validar tareas dentro de las fases
        if (fase.tareas && fase.tareas.length > 0) {
          for (const tarea of fase.tareas) {
            if (tarea.fecha_inicio && new Date(tarea.fecha_inicio) < nuevaFechaInicio) {
              throw new BadRequestException(
                `La tarea "${tarea.descripcion.substring(0, 50)}..." tiene una fecha de inicio anterior a la nueva fecha de inicio del proyecto`
              );
            }
            if (tarea.fecha_fin && new Date(tarea.fecha_fin) > nuevaFechaFin) {
              throw new BadRequestException(
                `La tarea "${tarea.descripcion.substring(0, 50)}..." tiene una fecha de fin posterior a la nueva fecha de fin del proyecto`
              );
            }
          }
        }
      }
    }

    // Guardar estado anterior para notificaciones
    const estadoAnteriorId = proyecto.id_estado;
    let estadoAnteriorNombre = 'Desconocido';
    let estadoNuevoNombre = 'Desconocido';

    // Obtener nombres de estados si hay cambio
    if (dto.id_estado !== undefined && dto.id_estado !== estadoAnteriorId) {
      const estadoAnterior = await this.estadoRepo.findOne({ where: { id_estado: estadoAnteriorId } });
      const estadoNuevo = await this.estadoRepo.findOne({ where: { id_estado: dto.id_estado } });
      estadoAnteriorNombre = estadoAnterior?.nombre || 'Desconocido';
      estadoNuevoNombre = estadoNuevo?.nombre || 'Desconocido';
    }

    // Validar presupuesto vs donaciones si se está actualizando
    if (dto.presupuesto_total !== undefined) {
      if (dto.presupuesto_total < 0) {
        throw new BadRequestException('El presupuesto no puede ser negativo');
      }
      if (dto.presupuesto_total > 999999999999.99) {
        throw new BadRequestException('El presupuesto excede el límite máximo permitido');
      }

      // Validar que el nuevo presupuesto no sea menor que las donaciones asignadas
      const { DonacionProyecto } = await import('../donacion-proyecto/donacion-proyecto.entity');
      const donacionProyectoRepo = this.repo.manager.getRepository(DonacionProyecto);
      const donacionesAsignadas = await donacionProyectoRepo
        .createQueryBuilder('dp')
        .where('dp.id_proyecto = :id_proyecto', { id_proyecto: id })
        .select('SUM(dp.monto_asignado)', 'total')
        .getRawOne();

      const totalDonaciones = parseFloat(donacionesAsignadas?.total || '0');
      if (dto.presupuesto_total < totalDonaciones) {
        throw new BadRequestException(
          `El presupuesto (${dto.presupuesto_total.toLocaleString()}) no puede ser menor que el total de donaciones asignadas (${totalDonaciones.toLocaleString()})`
        );
      }
    }

    // Validar imágenes si se están actualizando
    if (dto.imagen_principal !== undefined) {
      this.validateImageUrl(dto.imagen_principal);
    }
    if (dto.banner !== undefined && dto.banner) {
      this.validateImageUrl(dto.banner);
    }

    // Actualizar campos explícitamente para asegurar que todos los campos se manejen correctamente
    if (dto.nombre !== undefined) {
      if (dto.nombre.trim().length < 3) {
        throw new BadRequestException('El nombre del proyecto debe tener al menos 3 caracteres');
      }
      if (dto.nombre.trim().length > 100) {
        throw new BadRequestException('El nombre del proyecto no puede exceder 100 caracteres');
      }
      proyecto.nombre = dto.nombre.trim();
    }
    if (dto.descripcion !== undefined) {
      if (dto.descripcion.trim().length < 10) {
        throw new BadRequestException('La descripción del proyecto debe tener al menos 10 caracteres');
      }
      proyecto.descripcion = dto.descripcion.trim();
    }
    if (dto.objetivo !== undefined) {
      if (dto.objetivo.trim().length < 10) {
        throw new BadRequestException('El objetivo del proyecto debe tener al menos 10 caracteres');
      }
      proyecto.objetivo = dto.objetivo.trim();
    }
    if (dto.ubicacion !== undefined) proyecto.ubicacion = dto.ubicacion.trim();
    if (dto.fecha_inicio !== undefined) proyecto.fecha_inicio = typeof dto.fecha_inicio === 'string' ? new Date(dto.fecha_inicio) : dto.fecha_inicio;
    if (dto.fecha_fin !== undefined) proyecto.fecha_fin = typeof dto.fecha_fin === 'string' ? new Date(dto.fecha_fin) : dto.fecha_fin;
    if (dto.imagen_principal !== undefined) proyecto.imagen_principal = dto.imagen_principal;
    if (dto.documento !== undefined) proyecto.documento = dto.documento;
    if (dto.presupuesto_total !== undefined) proyecto.presupuesto_total = dto.presupuesto_total;
    if (dto.categoria !== undefined) proyecto.categoria = dto.categoria;
    if (dto.es_publico !== undefined) proyecto.es_publico = dto.es_publico;
    if (dto.requisitos !== undefined) proyecto.requisitos = dto.requisitos;
    if (dto.id_estado !== undefined) proyecto.id_estado = dto.id_estado;
    if (dto.banner !== undefined) proyecto.banner = dto.banner;

    const proyectoActualizado = await this.repo.save(proyecto);

    // Notificar cambio de estado si hubo cambio
    if (dto.id_estado !== undefined && dto.id_estado !== estadoAnteriorId) {
      try {
        await this.notificacionService.notificarCambioEstadoProyecto(
          proyecto.id_proyecto,
          proyecto.id_organizacion,
          estadoAnteriorNombre,
          estadoNuevoNombre,
          proyecto.nombre
        );
      } catch (error) {
        // No fallar la actualización si la notificación falla
        console.error('Error al notificar cambio de estado:', error);
      }
    }

    return proyectoActualizado;
  }

  async remove(id: number, user: Usuario) {
    const proyecto = await this.findOne(id);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para eliminar este proyecto.');
    }

    // Validar que no tenga asignaciones activas
    const asignaciones = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .innerJoin('asignacion.tarea', 'tarea')
      .innerJoin('tarea.fase', 'fase')
      .where('fase.id_proyecto = :idProyecto', { idProyecto: id })
      .getCount();
    
    if (asignaciones > 0) {
      throw new BadRequestException(
        `No se puede eliminar el proyecto porque tiene ${asignaciones} asignación(es) activa(s). Por favor, elimina primero todas las asignaciones de voluntarios.`
      );
    }

    // Validar que no tenga horas voluntariadas registradas
    const horasVoluntariadas = await this.horasRepo.count({
      where: { id_proyecto: id }
    });
    
    if (horasVoluntariadas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el proyecto porque tiene ${horasVoluntariadas} registro(s) de horas voluntariadas. Por favor, elimina primero todos los registros de horas.`
      );
    }

    try {
      return await this.repo.remove(proyecto);
    } catch (error) {
      // Manejar errores de restricciones de claves foráneas
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      
      if (
        errorCode === 'ER_ROW_IS_REFERENCED_2' || 
        errorCode === '23503' ||
        errorMessage.includes('foreign key constraint') ||
        errorMessage.includes('Cannot delete or update a parent row')
      ) {
        throw new BadRequestException(
          'No se puede eliminar el proyecto porque tiene registros relacionados (solicitudes, donaciones, etc.). Por favor, elimina primero todos los registros relacionados.'
        );
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  // --- MÉTODOS PARA GESTIONAR FASES ---
  async addFase(proyectoId: number, dto: CreateFaseDto, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para agregar fases a este proyecto.');
    }

    // Ensure id_proyecto is set from the URL parameter, not from DTO
    const fase = this.faseRepo.create({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion.trim(),
      orden: dto.orden,
      id_proyecto: proyectoId, // Always use the URL parameter
    });

    const savedFase = await this.faseRepo.save(fase);
    console.log(`Fase creada exitosamente:`, savedFase);
    
    // Return the full project with updated phases
    return this.findOne(proyectoId);
  }

  async updateFase(proyectoId: number, faseId: number, dto: Partial<CreateFaseDto>, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para actualizar fases de este proyecto.');
    }

    const fase = await this.faseRepo.findOne({
      where: { id_fase: faseId, id_proyecto: proyectoId },
    });

    if (!fase) {
      throw new NotFoundException(`Fase con ID ${faseId} no encontrada en el proyecto ${proyectoId}`);
    }

    this.faseRepo.merge(fase, dto);
    await this.faseRepo.save(fase);
    return this.findOne(proyectoId);
  }

  async reorderFases(proyectoId: number, ordenes: { id_fase: number; orden: number }[], user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para reordenar las fases de este proyecto.');
    }

    // Validar que todas las fases pertenecen al proyecto
    const faseIds = ordenes.map(o => o.id_fase);
    const fases = await this.faseRepo.find({
      where: faseIds.map(id => ({ id_fase: id, id_proyecto: proyectoId }))
    });

    if (fases.length !== ordenes.length) {
      throw new BadRequestException('Algunas fases no pertenecen a este proyecto');
    }

    // Actualizar el orden de cada fase
    const updates = ordenes.map(({ id_fase, orden }) =>
      this.faseRepo.update(id_fase, { orden })
    );

    await Promise.all(updates);

    // Retornar el proyecto actualizado con las fases reordenadas
    return this.findOne(proyectoId);
  }

  async removeFase(proyectoId: number, faseId: number, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para eliminar fases de este proyecto.');
    }

    const fase = await this.faseRepo.findOne({
      where: { id_fase: faseId, id_proyecto: proyectoId },
      relations: ['tareas', 'tareas.estado']
    });

    if (!fase) {
      throw new NotFoundException(`Fase con ID ${faseId} no encontrada en el proyecto ${proyectoId}`);
    }

    // Validar que la fase no tenga tareas con asignaciones o horas voluntariadas
    if (fase.tareas && fase.tareas.length > 0) {
      const tareasCompletadas = [];
      const tareasConAsignaciones = [];
      const tareasConHoras = [];
      
      // Estados que representan tareas completadas
      const estadosCompletados = ['Completado', 'Finalizado', 'Terminado', 'Cerrado', 'Completada', 'Finalizada'];
      
      for (const tarea of fase.tareas) {
        // Cargar estado si no está cargado
        if (!tarea.estado && tarea.id_estado) {
          tarea.estado = await this.estadoRepo.findOne({ where: { id_estado: tarea.id_estado } });
        }
        
        // Verificar si la tarea está completada
        const estadoNombre = tarea.estado?.nombre || '';
        const estaCompletada = estadosCompletados.some(estado => 
          estadoNombre.toLowerCase().includes(estado.toLowerCase())
        );
        
        if (estaCompletada) {
          tareasCompletadas.push(tarea);
        }
        
        const asignaciones = await this.asignacionRepo.find({
          where: { id_tarea: tarea.id_tarea }
        });
        
        if (asignaciones.length > 0) {
          tareasConAsignaciones.push({ tarea, count: asignaciones.length });
        }
        
        const horasVoluntariadas = await this.horasRepo.find({
          where: { id_tarea: tarea.id_tarea }
        });
        
        if (horasVoluntariadas.length > 0) {
          tareasConHoras.push({ tarea, count: horasVoluntariadas.length });
        }
      }
      
      // Construir mensaje de error detallado
      const mensajesError = [];
      
      if (tareasCompletadas.length > 0) {
        mensajesError.push(
          `La fase tiene ${tareasCompletadas.length} tarea(s) completada(s). ` +
          `Eliminar una fase con tareas completadas puede afectar el historial del proyecto. ` +
          `Por favor, verifica que realmente deseas eliminar esta fase.`
        );
      }
      
      if (tareasConAsignaciones.length > 0) {
        const totalAsignaciones = tareasConAsignaciones.reduce((sum, item) => sum + item.count, 0);
        mensajesError.push(
          `La fase tiene ${tareasConAsignaciones.length} tarea(s) con ${totalAsignaciones} asignación(es) activa(s). ` +
          `Por favor, elimina primero todas las asignaciones de las tareas de esta fase.`
        );
      }
      
      if (tareasConHoras.length > 0) {
        const totalHoras = tareasConHoras.reduce((sum, item) => sum + item.count, 0);
        mensajesError.push(
          `La fase tiene ${tareasConHoras.length} tarea(s) con ${totalHoras} registro(s) de horas voluntariadas. ` +
          `Por favor, elimina primero todos los registros de horas de las tareas de esta fase.`
        );
      }
      
      // Si hay tareas completadas pero no hay asignaciones ni horas, permitir con advertencia
      if (tareasCompletadas.length > 0 && tareasConAsignaciones.length === 0 && tareasConHoras.length === 0) {
        // Permitir eliminación pero lanzar BadRequestException con mensaje de advertencia
        throw new BadRequestException(
          `ADVERTENCIA: La fase tiene ${tareasCompletadas.length} tarea(s) completada(s). ` +
          `Eliminar esta fase eliminará el historial de estas tareas completadas. ` +
          `Si estás seguro, puedes proceder eliminando primero las tareas completadas manualmente.`
        );
      }
      
      // Si hay asignaciones o horas, bloquear eliminación
      if (tareasConAsignaciones.length > 0 || tareasConHoras.length > 0) {
        throw new BadRequestException(mensajesError.join(' '));
      }
    }

    await this.faseRepo.remove(fase);
    return this.findOne(proyectoId);
  }

  // --- MÉTODOS PARA GESTIONAR TAREAS ---
  async addTarea(proyectoId: number, dto: CreateTareaDto, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para agregar tareas a este proyecto.');
    }

    // Verificar que la fase pertenece al proyecto
    const fase = await this.faseRepo.findOne({
      where: { id_fase: dto.id_fase, id_proyecto: proyectoId },
    });

    if (!fase) {
      throw new NotFoundException(`Fase con ID ${dto.id_fase} no encontrada en el proyecto ${proyectoId}`);
    }

    const tarea = this.tareaRepo.create(dto);
    await this.tareaRepo.save(tarea);
    return this.findOne(proyectoId);
  }

  async updateTarea(proyectoId: number, tareaId: number, dto: Partial<CreateTareaDto>, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para actualizar tareas de este proyecto.');
    }

    const tarea = await this.tareaRepo.findOne({
      where: { id_tarea: tareaId },
      relations: ['fase'],
    });

    if (!tarea || tarea.fase.id_proyecto !== proyectoId) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada en el proyecto ${proyectoId}`);
    }

    this.tareaRepo.merge(tarea, dto);
    await this.tareaRepo.save(tarea);
    return this.findOne(proyectoId);
  }

  async removeTarea(proyectoId: number, tareaId: number, user: Usuario) {
    const proyecto = await this.findOne(proyectoId);
    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });

    if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
      throw new ForbiddenException('No tienes permiso para eliminar tareas de este proyecto.');
    }

    const tarea = await this.tareaRepo.findOne({
      where: { id_tarea: tareaId },
      relations: ['fase'],
    });

    if (!tarea || tarea.fase.id_proyecto !== proyectoId) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada en el proyecto ${proyectoId}`);
    }

    await this.tareaRepo.remove(tarea);
    return this.findOne(proyectoId);
  }

  // Método para obtener proyectos del voluntario con sus roles asignados
  async findProjectsByVoluntario(id_usuario: number) {
    try {
      // Obtener el voluntario
      const voluntario = await this.voluntarioRepo.findOne({ 
        where: { id_usuario },
        relations: ['usuario']
      });
      
      if (!voluntario) {
        console.log(`Voluntario no encontrado para usuario ${id_usuario}`);
        return [];
      }

      console.log(`Buscando proyectos para voluntario ${voluntario.id_voluntario}`);

      // 1. Obtener proyectos donde el voluntario tiene asignaciones (tareas asignadas)
      let asignaciones;
      try {
        asignaciones = await this.asignacionRepo.find({
          where: { id_voluntario: voluntario.id_voluntario },
          relations: ['tarea', 'tarea.fase', 'tarea.fase.proyecto', 'rol']
        });
      } catch (relationError) {
        console.error('Error cargando asignaciones con relaciones:', relationError);
        asignaciones = await this.asignacionRepo.find({
          where: { id_voluntario: voluntario.id_voluntario }
        });
        
        for (const asignacion of asignaciones) {
          try {
            const tarea = await this.tareaRepo.findOne({
              where: { id_tarea: asignacion.id_tarea },
              relations: ['fase', 'fase.proyecto']
            });
            asignacion.tarea = tarea;
            
            if (asignacion.id_rol) {
              const rol = await this.rolRepo.findOne({
                where: { id_rol: asignacion.id_rol }
              });
              asignacion.rol = rol;
            }
          } catch (loadError) {
            console.error(`Error cargando relaciones para asignación ${asignacion.id_asignacion}:`, loadError);
          }
        }
      }

      // 2. Obtener proyectos donde el voluntario tiene solicitudes de inscripción aprobadas
      const solicitudesAprobadas = await this.solicitudRepo.find({
        where: {
          id_voluntario: voluntario.id_voluntario,
          estado: 'aprobada'
        },
        relations: ['proyecto']
      });

      console.log(`Encontradas ${asignaciones.length} asignaciones y ${solicitudesAprobadas.length} solicitudes aprobadas`);

      // 3. Agrupar proyectos por ID (de asignaciones y solicitudes aprobadas)
      const proyectosMap = new Map<number, any>();
      
      // Agregar proyectos de asignaciones
      asignaciones.forEach(asignacion => {
        const proyecto = asignacion.tarea?.fase?.proyecto;
        if (!proyecto) return;

        const proyectoId = proyecto.id_proyecto;
        
        if (!proyectosMap.has(proyectoId)) {
          proyectosMap.set(proyectoId, {
            proyecto: proyecto,
            roles: new Set(),
            rolesArray: [],
            tieneAsignaciones: true,
            tieneSolicitudAprobada: false
          });
        }

        const proyectoData = proyectosMap.get(proyectoId);
        proyectoData.tieneAsignaciones = true;

        // Agregar rol si existe
        if (asignacion.rol) {
          proyectoData.roles.add(asignacion.rol.id_rol);
        }
      });

      // Agregar proyectos de solicitudes aprobadas (incluso sin asignaciones)
      // Usar for...of en lugar de forEach para permitir await
      for (const solicitud of solicitudesAprobadas) {
        const proyectoId = solicitud.id_proyecto;
        
        if (!proyectosMap.has(proyectoId)) {
          // Si no está en el mapa, intentar obtener el proyecto desde la relación o cargarlo
          let proyecto = solicitud.proyecto;
          
          // Si la relación no está cargada, cargar el proyecto manualmente
          if (!proyecto && proyectoId) {
            proyecto = await this.repo.findOne({
              where: { id_proyecto: proyectoId },
              relations: ['organizacion', 'estado']
            });
          }
          
          if (proyecto) {
            proyectosMap.set(proyectoId, {
              proyecto: proyecto,
              roles: new Set(),
              rolesArray: [],
              tieneAsignaciones: false,
              tieneSolicitudAprobada: true
            });
          }
        } else {
          // Si ya está en el mapa, marcar que tiene solicitud aprobada
          proyectosMap.get(proyectoId).tieneSolicitudAprobada = true;
        }
      }

      // Si no hay proyectos (ni asignaciones ni solicitudes aprobadas), retornar vacío
      if (proyectosMap.size === 0) {
        return [];
      }

      // 4. Obtener proyectos completos con todas sus relaciones
      const proyectosIds = Array.from(proyectosMap.keys());
      const proyectos = await this.repo.find({
        where: proyectosIds.map(id => ({ id_proyecto: id })),
        relations: ['organizacion', 'estado', 'beneficio', 'fases', 'fases.tareas'],
        order: { creado_en: 'DESC' }
      });

      // 5. Combinar proyectos con roles asignados
      return proyectos.map(proyecto => {
        const proyectoData = proyectosMap.get(proyecto.id_proyecto);
        if (!proyectoData) return null;

        const rolesIds = Array.from(proyectoData.roles);
        
        // Obtener roles completos de las asignaciones
        const rolesAsignados = asignaciones
          .filter(a => {
            const proyId = a.tarea?.fase?.proyecto?.id_proyecto;
            return proyId === proyecto.id_proyecto && a.rol;
          })
          .map(a => ({
            id_rol: a.rol.id_rol,
            nombre: a.rol.nombre,
            descripcion: a.rol.descripcion,
            tipo_rol: a.rol.tipo_rol
          }))
          .filter((rol, index, self) => 
            index === self.findIndex(r => r.id_rol === rol.id_rol)
          );

        return {
          ...proyecto,
          rolesAsignados: rolesAsignados,
          roles: rolesAsignados.length > 0 
            ? rolesAsignados.map(r => r.nombre).join(', ') 
            : 'Voluntario', // Si no tiene roles asignados, mostrar "Voluntario" por defecto
          tieneAsignaciones: proyectoData.tieneAsignaciones || false,
          tieneSolicitudAprobada: proyectoData.tieneSolicitudAprobada || false
        };
      }).filter(p => p !== null); // Filtrar nulls por si acaso
    } catch (error) {
      console.error('Error en findProjectsByVoluntario:', error);
      return [];
    }
  }

  async findOneForVolunteer(id_proyecto: number, id_usuario: number) {
    // Obtener el proyecto
    const proyecto = await this.findOne(id_proyecto);
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    // Obtener el voluntario
    const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    // Obtener asignaciones del voluntario en este proyecto
    const asignaciones = await this.asignacionRepo.find({
      where: { id_voluntario: voluntario.id_voluntario },
      relations: ['tarea', 'tarea.fase', 'tarea.estado', 'rol']
    });

    const asignacionesProyecto = asignaciones.filter(a => 
      a.tarea?.fase?.id_proyecto === id_proyecto
    );

    // Obtener roles únicos asignados
    const rolesAsignados = asignacionesProyecto
      .map(a => a.rol)
      .filter((rol, index, self) => 
        rol && index === self.findIndex(r => r && r.id_rol === rol.id_rol)
      );

    // Obtener horas registradas del voluntario en este proyecto
    const horas = await this.horasRepo.find({
      where: {
        id_voluntario: voluntario.id_voluntario,
        id_proyecto: id_proyecto
      },
      relations: ['tarea'],
      order: { fecha: 'DESC', creado_en: 'DESC' }
    });

    // Calcular resumen de horas
    const totalHoras = horas.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
    const horasVerificadas = horas.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);

    // Calcular progreso personal (tareas completadas vs total asignadas)
    const tareasCompletadas = asignacionesProyecto.filter(a => {
      const estado = a.tarea?.estado;
      return estado && (estado.nombre?.toLowerCase().includes('complet') || estado.nombre?.toLowerCase().includes('finaliz'));
    }).length;

    return {
      ...proyecto,
      rolesAsignados: rolesAsignados,
      asignaciones: asignacionesProyecto,
      horas: horas,
      resumenHoras: {
        totalHoras: parseFloat(totalHoras.toFixed(2)),
        horasVerificadas: parseFloat(horasVerificadas.toFixed(2)),
        horasPendientes: parseFloat((totalHoras - horasVerificadas).toFixed(2)),
        totalRegistros: horas.length
      },
      progresoPersonal: {
        tareasAsignadas: asignacionesProyecto.length,
        tareasCompletadas: tareasCompletadas,
        porcentajeCompletado: asignacionesProyecto.length > 0 
          ? Math.round((tareasCompletadas / asignacionesProyecto.length) * 100)
          : 0
      }
    };
  }
}