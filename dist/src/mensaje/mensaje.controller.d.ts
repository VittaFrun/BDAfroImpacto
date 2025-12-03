import { Usuario } from '../users/user.entity';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
export declare class MensajeController {
    private readonly mensajeService;
    constructor(mensajeService: MensajeService);
    crearMensaje(createMensajeDto: CreateMensajeDto, user: Usuario): Promise<import("./mensaje.entity").Mensaje>;
    obtenerConversaciones(user: Usuario): Promise<import("./conversacion.entity").Conversacion[]>;
    obtenerMensajes(idConversacion: number, user: Usuario, limit?: number, before?: string): Promise<import("./mensaje.entity").Mensaje[]>;
    marcarComoLeido(id: number, user: Usuario): Promise<{
        success: boolean;
    }>;
    eliminarMensaje(id: number, user: Usuario): Promise<{
        success: boolean;
    }>;
    contarNoLeidos(user: Usuario): Promise<{
        count: number;
    }>;
}
