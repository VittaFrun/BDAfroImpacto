import { Usuario } from '../users/user.entity';
export declare class HistorialCambios {
    id_historial: number;
    tipo_entidad: 'proyecto' | 'tarea' | 'fase' | 'voluntario' | 'organizacion' | 'asignacion' | 'horas';
    id_entidad: number;
    accion: 'crear' | 'actualizar' | 'eliminar' | 'restaurar';
    datos_anteriores: any;
    datos_nuevos: any;
    campos_modificados: string[];
    descripcion: string;
    direccion_ip: string;
    user_agent: string;
    id_usuario: number;
    creado_en: Date;
    usuario: Usuario;
}
