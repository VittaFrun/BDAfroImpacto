import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
interface AuthenticatedSocket extends Socket {
    userId?: number;
}
export declare class MensajeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private mensajeService;
    private jwtService;
    server: Server;
    private connectedUsers;
    constructor(mensajeService: MensajeService, jwtService: JwtService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleMensaje(createMensajeDto: CreateMensajeDto, client: AuthenticatedSocket): Promise<{
        success: boolean;
        mensaje: import("./mensaje.entity").Mensaje;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        mensaje?: undefined;
    }>;
    handleMarcarLeido(data: {
        id_mensaje: number;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
    }>;
    handleEscribiendo(data: {
        id_destinatario: number;
        escribiendo: boolean;
    }, client: AuthenticatedSocket): Promise<void>;
    isUserOnline(userId: number): boolean;
    getConnectedUsers(): number[];
}
export {};
