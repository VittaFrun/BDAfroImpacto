import { NotificacionService } from './notificacion.service';
import { Usuario } from '../users/user.entity';
export declare class NotificacionController {
    private readonly service;
    constructor(service: NotificacionService);
    getMisNotificaciones(user: Usuario, soloNoLeidas?: string): Promise<import("./notificacion.entity").Notificacion[]>;
    contarNoLeidas(user: Usuario): Promise<number>;
    marcarComoLeida(id: string, user: Usuario): Promise<import("./notificacion.entity").Notificacion>;
    marcarTodasComoLeidas(user: Usuario): Promise<{
        message: string;
    }>;
    crear(dto: any): Promise<import("./notificacion.entity").Notificacion>;
    eliminar(id: string, user: Usuario): Promise<import("typeorm").DeleteResult>;
}
