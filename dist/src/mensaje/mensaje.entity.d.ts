import { Usuario } from '../users/user.entity';
export declare class Mensaje {
    id_mensaje: number;
    id_conversacion: number | null;
    id_remitente: number;
    remitente: Usuario;
    id_destinatario: number;
    destinatario: Usuario;
    contenido: string;
    tipo: string;
    archivo_url: string | null;
    archivo_nombre: string | null;
    archivo_tipo: string | null;
    archivo_tamaño: number | null;
    leido: boolean;
    fecha_leido: Date | null;
    eliminado_remitente: boolean;
    eliminado_destinatario: boolean;
    creado_en: Date;
    actualizado_en: Date;
}
