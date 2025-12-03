import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comentario } from './comentario.entity';
import { CreateComentarioDto } from './create-comentario.dto';
import { UpdateComentarioDto } from './update-comentario.dto';
import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Fase } from '../fase/fase.entity';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class ComentarioService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Fase)
    private readonly faseRepository: Repository<Fase>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async create(createComentarioDto: CreateComentarioDto, idUsuario: number): Promise<Comentario> {
    // Validar que la entidad existe
    await this.validateEntity(createComentarioDto.tipo_entidad, createComentarioDto.id_entidad);

    // Si es una respuesta, validar que el comentario padre existe
    if (createComentarioDto.id_comentario_padre) {
      const comentarioPadre = await this.comentarioRepository.findOne({
        where: { id_comentario: createComentarioDto.id_comentario_padre },
      });
      if (!comentarioPadre) {
        throw new NotFoundException('Comentario padre no encontrado');
      }
    }

    // Crear comentario
    const comentario = this.comentarioRepository.create({
      ...createComentarioDto,
      id_usuario: idUsuario,
      id_tarea: createComentarioDto.tipo_entidad === 'tarea' ? createComentarioDto.id_entidad : null,
      id_proyecto: createComentarioDto.tipo_entidad === 'proyecto' ? createComentarioDto.id_entidad : null,
      id_fase: createComentarioDto.tipo_entidad === 'fase' ? createComentarioDto.id_entidad : null,
    });

    const comentarioGuardado = await this.comentarioRepository.save(comentario);

    // Cargar relaciones
    await this.comentarioRepository.findOne({
      where: { id_comentario: comentarioGuardado.id_comentario },
      relations: ['usuario', 'comentario_padre', 'respuestas'],
    });

    // Notificar menciones (mejorado)
    if (createComentarioDto.menciones && createComentarioDto.menciones.length > 0) {
      await this.notificarMenciones(
        createComentarioDto.menciones,
        comentarioGuardado,
        idUsuario,
      );
    }

    // Notificar a otros participantes (excepto al autor)
    await this.notificarParticipantes(comentarioGuardado, idUsuario);

    return comentarioGuardado;
  }

  async findAll(
    tipoEntidad: string,
    idEntidad: number,
    includeRespuestas: boolean = true,
  ): Promise<Comentario[]> {
    const where: any = {
      tipo_entidad: tipoEntidad,
      id_entidad: idEntidad,
      eliminado: false,
    };

    if (includeRespuestas) {
      where.id_comentario_padre = null; // Solo comentarios principales
    }

    return this.comentarioRepository.find({
      where,
      relations: ['usuario', 'comentario_padre', 'respuestas', 'respuestas.usuario'],
      order: { creado_en: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findOne({
      where: { id_comentario: id },
      relations: ['usuario', 'comentario_padre', 'respuestas', 'respuestas.usuario'],
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  async update(
    id: number,
    updateComentarioDto: UpdateComentarioDto,
    idUsuario: number,
  ): Promise<Comentario> {
    const comentario = await this.findOne(id);

    // Solo el autor puede editar
    if (comentario.id_usuario !== idUsuario) {
      throw new ForbiddenException('No tienes permisos para editar este comentario');
    }

    if (comentario.eliminado) {
      throw new BadRequestException('No se puede editar un comentario eliminado');
    }

    Object.assign(comentario, updateComentarioDto);
    comentario.editado = true;
    comentario.fecha_edicion = new Date();

    // Notificar nuevas menciones
    if (updateComentarioDto.menciones && updateComentarioDto.menciones.length > 0) {
      await this.notificarMenciones(updateComentarioDto.menciones, comentario, idUsuario);
    }

    return this.comentarioRepository.save(comentario);
  }

  async remove(id: number, idUsuario: number): Promise<void> {
    const comentario = await this.findOne(id);

    // Solo el autor puede eliminar
    if (comentario.id_usuario !== idUsuario) {
      throw new ForbiddenException('No tienes permisos para eliminar este comentario');
    }

    // Eliminación suave
    comentario.eliminado = true;
    comentario.fecha_eliminacion = new Date();
    await this.comentarioRepository.save(comentario);
  }

  private async validateEntity(tipoEntidad: string, idEntidad: number): Promise<void> {
    let exists = false;

    switch (tipoEntidad) {
      case 'tarea':
        exists = !!(await this.tareaRepository.findOne({ where: { id_tarea: idEntidad } }));
        break;
      case 'proyecto':
        exists = !!(await this.proyectoRepository.findOne({ where: { id_proyecto: idEntidad } }));
        break;
      case 'fase':
        exists = !!(await this.faseRepository.findOne({ where: { id_fase: idEntidad } }));
        break;
      default:
        throw new BadRequestException(`Tipo de entidad inválido: ${tipoEntidad}`);
    }

    if (!exists) {
      throw new NotFoundException(`${tipoEntidad} con ID ${idEntidad} no encontrado`);
    }
  }

  private async notificarMenciones(
    mencionados: number[],
    comentario: Comentario,
    idAutor: number,
  ): Promise<void> {
    // Obtener información del autor
    const autor = await this.usuarioRepository.findOne({ where: { id_usuario: idAutor } });
    const nombreAutor = autor?.nombre || 'Un usuario';

    const usuariosMencionados = await this.usuarioRepository.find({
      where: { id_usuario: In(mencionados.filter(id => id !== idAutor)) },
    });

    // Obtener información de la tarea si aplica
    if (comentario.tipo_entidad === 'tarea' && comentario.id_tarea) {
      const tarea = await this.tareaRepository.findOne({
        where: { id_tarea: comentario.id_tarea },
        relations: ['fase', 'fase.proyecto'],
      });

      if (tarea) {
        // Notificar usando el método mejorado del servicio
        for (const usuario of usuariosMencionados) {
          await this.notificacionService.notificarNuevoComentario(
            idAutor,
            comentario.id_tarea,
            tarea.fase?.id_proyecto || comentario.id_proyecto || null,
            tarea.descripcion || 'Tarea sin nombre',
            nombreAutor,
            true // Es mención
          );
        }
      } else {
        // Fallback para otros tipos de entidad
        for (const usuario of usuariosMencionados) {
          await this.notificacionService.crear({
            id_usuario: usuario.id_usuario,
            titulo: 'Has sido mencionado',
            mensaje: `${nombreAutor} te ha mencionado en un comentario de ${comentario.tipo_entidad}`,
            tipo: 'warning',
            id_proyecto: comentario.id_proyecto || null,
            tipo_entidad: 'comentario',
            id_entidad: comentario.id_comentario,
            datos_adicionales: {
              id_comentario: comentario.id_comentario,
              id_autor: idAutor,
            },
          });
        }
      }
    } else {
      // Para otros tipos de entidad
      for (const usuario of usuariosMencionados) {
        await this.notificacionService.crear({
          id_usuario: usuario.id_usuario,
          titulo: 'Has sido mencionado',
          mensaje: `${nombreAutor} te ha mencionado en un comentario de ${comentario.tipo_entidad}`,
          tipo: 'warning',
          id_proyecto: comentario.id_proyecto || null,
          tipo_entidad: 'comentario',
          id_entidad: comentario.id_comentario,
          datos_adicionales: {
            id_comentario: comentario.id_comentario,
            id_autor: idAutor,
          },
        });
      }
    }
  }

  private async notificarParticipantes(comentario: Comentario, idAutor: number): Promise<void> {
    // Obtener información del autor
    const autor = await this.usuarioRepository.findOne({ where: { id_usuario: idAutor } });
    const nombreAutor = autor?.nombre || 'Un usuario';

    // Obtener participantes según el tipo de entidad
    if (comentario.tipo_entidad === 'tarea' && comentario.id_tarea) {
      const tarea = await this.tareaRepository.findOne({
        where: { id_tarea: comentario.id_tarea },
        relations: ['fase', 'fase.proyecto'],
      });

      if (tarea) {
        // Usar el nuevo método del servicio de notificaciones
        await this.notificacionService.notificarNuevoComentario(
          idAutor,
          comentario.id_tarea,
          tarea.fase?.id_proyecto || comentario.id_proyecto || null,
          tarea.descripcion || 'Tarea sin nombre',
          nombreAutor,
          false
        );
      }
    } else if (comentario.tipo_entidad === 'proyecto' && comentario.id_proyecto) {
      const proyecto = await this.proyectoRepository.findOne({
        where: { id_proyecto: comentario.id_proyecto },
        relations: ['organizacion', 'organizacion.usuario'],
      });
      
      if (proyecto?.organizacion?.usuario?.id_usuario && proyecto.organizacion.usuario.id_usuario !== idAutor) {
        await this.notificacionService.crear({
          id_usuario: proyecto.organizacion.usuario.id_usuario,
          titulo: 'Nuevo Comentario',
          mensaje: `${nombreAutor} ha comentado en el proyecto "${proyecto.nombre}"`,
          tipo: 'info',
          id_proyecto: comentario.id_proyecto,
          tipo_entidad: 'comentario',
          id_entidad: comentario.id_comentario,
          datos_adicionales: {
            id_comentario: comentario.id_comentario,
            id_autor: idAutor,
          },
        });
      }
    }
  }
}

