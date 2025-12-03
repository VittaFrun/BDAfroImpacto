import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
export declare class EliminacionHistorial {
    id_eliminacion: number;
    tipo_entidad: string;
    id_entidad: number;
    nombre_entidad: string;
    descripcion: string;
    id_proyecto: number;
    proyecto: Proyecto;
    id_usuario_eliminador: number;
    usuario_eliminador: Usuario;
    razon: string;
    datos_adicionales: any;
    fecha_eliminacion: Date;
}
