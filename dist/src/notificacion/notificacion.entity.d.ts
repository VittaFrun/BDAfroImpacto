import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
export declare class Notificacion {
    id_notificacion: number;
    id_usuario: number;
    usuario: Usuario;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    id_proyecto: number;
    proyecto: Proyecto;
    tipo_entidad: string;
    id_entidad: number;
    datos_adicionales: any;
    fecha_creacion: Date;
}
