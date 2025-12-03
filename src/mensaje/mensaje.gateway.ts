import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/mensajes',
})
export class MensajeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(
    private mensajeService: MensajeService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.id_usuario;

      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      this.connectedUsers.set(userId, client.id);

      // Notificar que el usuario está en línea
      client.broadcast.emit('usuario-online', { userId });
      
      // Unirse a la sala personal del usuario
      client.join(`user:${userId}`);

      console.log(`Usuario ${userId} conectado. Socket: ${client.id}`);
    } catch (error) {
      console.error('Error en autenticación WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      // Notificar que el usuario está desconectado
      client.broadcast.emit('usuario-offline', { userId: client.userId });
      
      console.log(`Usuario ${client.userId} desconectado. Socket: ${client.id}`);
    }
  }

  @SubscribeMessage('enviar-mensaje')
  async handleMensaje(
    @MessageBody() createMensajeDto: CreateMensajeDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'No autenticado' };
    }

    try {
      const mensaje = await this.mensajeService.crearMensaje(
        createMensajeDto,
        client.userId,
      );

      // Enviar mensaje al destinatario si está conectado
      const destinatarioSocketId = this.connectedUsers.get(createMensajeDto.id_destinatario);
      if (destinatarioSocketId) {
        this.server.to(destinatarioSocketId).emit('nuevo-mensaje', mensaje);
      }

      // Enviar confirmación al remitente
      client.emit('mensaje-enviado', mensaje);

      // Notificar actualización de conversación a ambos usuarios
      this.server.to(`user:${client.userId}`).emit('conversacion-actualizada', {
        id_conversacion: mensaje.id_conversacion,
      });
      this.server.to(`user:${createMensajeDto.id_destinatario}`).emit('conversacion-actualizada', {
        id_conversacion: mensaje.id_conversacion,
      });

      return { success: true, mensaje };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('marcar-leido')
  async handleMarcarLeido(
    @MessageBody() data: { id_mensaje: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'No autenticado' };
    }

    try {
      await this.mensajeService.marcarComoLeido(data.id_mensaje, client.userId);
      
      // Notificar al remitente que su mensaje fue leído
      client.broadcast.emit('mensaje-leido', {
        id_mensaje: data.id_mensaje,
        leido_por: client.userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('escribiendo')
  async handleEscribiendo(
    @MessageBody() data: { id_destinatario: number; escribiendo: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return;
    }

    const destinatarioSocketId = this.connectedUsers.get(data.id_destinatario);
    if (destinatarioSocketId) {
      this.server.to(destinatarioSocketId).emit('usuario-escribiendo', {
        id_usuario: client.userId,
        escribiendo: data.escribiendo,
      });
    }
  }

  // Método para verificar si un usuario está en línea
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  // Método para obtener todos los usuarios conectados
  getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}

