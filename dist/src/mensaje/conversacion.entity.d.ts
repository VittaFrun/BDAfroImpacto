import { Usuario } from '../users/user.entity';
import { Mensaje } from './mensaje.entity';
export declare class Conversacion {
    id_conversacion: number;
    id_usuario1: number;
    usuario1: Usuario;
    id_usuario2: number;
    usuario2: Usuario;
    ultimo_mensaje: string | null;
    fecha_ultimo_mensaje: Date | null;
    mensajes_no_leidos_usuario1: number;
    mensajes_no_leidos_usuario2: number;
    archivada_usuario1: boolean;
    archivada_usuario2: boolean;
    mensajes: Mensaje[];
    creado_en: Date;
    actualizado_en: Date;
}
