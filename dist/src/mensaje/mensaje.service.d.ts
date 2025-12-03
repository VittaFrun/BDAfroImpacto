import { Repository } from 'typeorm';
import { Mensaje } from './mensaje.entity';
import { Conversacion } from './conversacion.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
export declare class MensajeService {
    private mensajeRepository;
    private conversacionRepository;
    constructor(mensajeRepository: Repository<Mensaje>, conversacionRepository: Repository<Conversacion>);
    crearMensaje(createMensajeDto: CreateMensajeDto, idRemitente: number): Promise<Mensaje>;
    obtenerConversaciones(idUsuario: number): Promise<Conversacion[]>;
    obtenerMensajes(idConversacion: number, idUsuario: number, limit?: number, before?: Date): Promise<Mensaje[]>;
    marcarComoLeido(idMensaje: number, idUsuario: number): Promise<void>;
    eliminarMensaje(idMensaje: number, idUsuario: number): Promise<void>;
    contarMensajesNoLeidos(idUsuario: number): Promise<number>;
}
