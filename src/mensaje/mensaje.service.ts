import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { Mensaje } from './mensaje.entity';
import { Conversacion } from './conversacion.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajeRepository: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private conversacionRepository: Repository<Conversacion>,
  ) {}

  async crearMensaje(createMensajeDto: CreateMensajeDto, idRemitente: number): Promise<Mensaje> {
    // Verificar que el destinatario existe y no es el mismo que el remitente
    if (createMensajeDto.id_destinatario === idRemitente) {
      throw new ForbiddenException('No puedes enviarte mensajes a ti mismo');
    }

    // Buscar o crear conversación
    let conversacion = await this.conversacionRepository.findOne({
      where: [
        { id_usuario1: idRemitente, id_usuario2: createMensajeDto.id_destinatario },
        { id_usuario1: createMensajeDto.id_destinatario, id_usuario2: idRemitente },
      ],
    });

    if (!conversacion) {
      conversacion = this.conversacionRepository.create({
        id_usuario1: idRemitente,
        id_usuario2: createMensajeDto.id_destinatario,
        mensajes_no_leidos_usuario2: 0,
      });
      conversacion = await this.conversacionRepository.save(conversacion);
    }

    // Crear mensaje
    const mensaje = this.mensajeRepository.create({
      id_conversacion: conversacion.id_conversacion,
      id_remitente: idRemitente,
      id_destinatario: createMensajeDto.id_destinatario,
      contenido: createMensajeDto.contenido,
      tipo: createMensajeDto.tipo || 'texto',
      archivo_url: createMensajeDto.archivo_url,
      archivo_nombre: createMensajeDto.archivo_nombre,
      archivo_tipo: createMensajeDto.archivo_tipo,
      archivo_tamaño: createMensajeDto.archivo_tamaño,
      leido: false,
    });

    const mensajeGuardado = await this.mensajeRepository.save(mensaje);

    // Actualizar conversación
    conversacion.ultimo_mensaje = createMensajeDto.contenido.substring(0, 100);
    conversacion.fecha_ultimo_mensaje = new Date();
    
    if (conversacion.id_usuario1 === idRemitente) {
      conversacion.mensajes_no_leidos_usuario2 += 1;
    } else {
      conversacion.mensajes_no_leidos_usuario1 += 1;
    }

    await this.conversacionRepository.save(conversacion);

    return mensajeGuardado;
  }

  async obtenerConversaciones(idUsuario: number): Promise<Conversacion[]> {
    const conversaciones = await this.conversacionRepository.find({
      where: [
        { id_usuario1: idUsuario },
        { id_usuario2: idUsuario },
      ],
      relations: ['usuario1', 'usuario2'],
      order: { fecha_ultimo_mensaje: 'DESC' },
    });

    return conversaciones.map(conv => {
      // Determinar el otro usuario
      const otroUsuario = conv.id_usuario1 === idUsuario ? conv.usuario2 : conv.usuario1;
      const mensajesNoLeidos = conv.id_usuario1 === idUsuario 
        ? conv.mensajes_no_leidos_usuario1 
        : conv.mensajes_no_leidos_usuario2;
      const archivada = conv.id_usuario1 === idUsuario 
        ? conv.archivada_usuario1 
        : conv.archivada_usuario2;

      return {
        ...conv,
        otro_usuario: otroUsuario,
        mensajes_no_leidos: mensajesNoLeidos,
        archivada,
      } as any;
    });
  }

  async obtenerMensajes(
    idConversacion: number,
    idUsuario: number,
    limit: number = 50,
    before?: Date,
  ): Promise<Mensaje[]> {
    // Verificar que el usuario pertenece a la conversación
    const conversacion = await this.conversacionRepository.findOne({
      where: [
        { id_conversacion: idConversacion, id_usuario1: idUsuario },
        { id_conversacion: idConversacion, id_usuario2: idUsuario },
      ],
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const queryBuilder = this.mensajeRepository
      .createQueryBuilder('mensaje')
      .where('mensaje.id_conversacion = :idConversacion', { idConversacion })
      .andWhere(
        '(mensaje.eliminado_remitente = false AND mensaje.id_remitente = :idUsuario) OR ' +
        '(mensaje.eliminado_destinatario = false AND mensaje.id_destinatario = :idUsuario)',
        { idUsuario }
      )
      .orderBy('mensaje.creado_en', 'DESC')
      .limit(limit);

    if (before) {
      queryBuilder.andWhere('mensaje.creado_en < :before', { before });
    }

    const mensajes = await queryBuilder.getMany();

    // Marcar mensajes como leídos
    const mensajesNoLeidos = mensajes.filter(
      m => !m.leido && m.id_destinatario === idUsuario
    );

    if (mensajesNoLeidos.length > 0) {
      await this.mensajeRepository.update(
        { id_mensaje: In(mensajesNoLeidos.map(m => m.id_mensaje)) },
        { leido: true, fecha_leido: new Date() }
      );

      // Actualizar contador en conversación
      if (conversacion.id_usuario1 === idUsuario) {
        conversacion.mensajes_no_leidos_usuario1 = 0;
      } else {
        conversacion.mensajes_no_leidos_usuario2 = 0;
      }
      await this.conversacionRepository.save(conversacion);
    }

    return mensajes.reverse(); // Ordenar del más antiguo al más reciente
  }

  async marcarComoLeido(idMensaje: number, idUsuario: number): Promise<void> {
    const mensaje = await this.mensajeRepository.findOne({
      where: { id_mensaje: idMensaje, id_destinatario: idUsuario },
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (!mensaje.leido) {
      mensaje.leido = true;
      mensaje.fecha_leido = new Date();
      await this.mensajeRepository.save(mensaje);

      // Actualizar contador en conversación
      const conversacion = await this.conversacionRepository.findOne({
        where: { id_conversacion: mensaje.id_conversacion },
      });

      if (conversacion) {
        if (conversacion.id_usuario1 === idUsuario) {
          conversacion.mensajes_no_leidos_usuario1 = Math.max(0, conversacion.mensajes_no_leidos_usuario1 - 1);
        } else {
          conversacion.mensajes_no_leidos_usuario2 = Math.max(0, conversacion.mensajes_no_leidos_usuario2 - 1);
        }
        await this.conversacionRepository.save(conversacion);
      }
    }
  }

  async eliminarMensaje(idMensaje: number, idUsuario: number): Promise<void> {
    const mensaje = await this.mensajeRepository.findOne({
      where: { id_mensaje: idMensaje },
    });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (mensaje.id_remitente === idUsuario) {
      mensaje.eliminado_remitente = true;
    } else if (mensaje.id_destinatario === idUsuario) {
      mensaje.eliminado_destinatario = true;
    } else {
      throw new ForbiddenException('No tienes permiso para eliminar este mensaje');
    }

    await this.mensajeRepository.save(mensaje);
  }

  async contarMensajesNoLeidos(idUsuario: number): Promise<number> {
    const conversaciones = await this.conversacionRepository.find({
      where: [
        { id_usuario1: idUsuario },
        { id_usuario2: idUsuario },
      ],
    });

    return conversaciones.reduce((total, conv) => {
      return total + (conv.id_usuario1 === idUsuario 
        ? conv.mensajes_no_leidos_usuario1 
        : conv.mensajes_no_leidos_usuario2);
    }, 0);
  }
}

