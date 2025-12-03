import { Repository } from 'typeorm';
import { HistorialCambios } from './historial-cambios.entity';
import { Usuario } from '../users/user.entity';
export interface CambioData {
    tipo_entidad: 'proyecto' | 'tarea' | 'fase' | 'voluntario' | 'organizacion' | 'asignacion' | 'horas';
    id_entidad: number;
    accion: 'crear' | 'actualizar' | 'eliminar' | 'restaurar';
    datos_anteriores?: any;
    datos_nuevos?: any;
    descripcion?: string;
    direccion_ip?: string;
    user_agent?: string;
}
export declare class HistorialCambiosService {
    private readonly historialRepo;
    constructor(historialRepo: Repository<HistorialCambios>);
    registrarCambio(cambio: CambioData, usuario: Usuario): Promise<HistorialCambios>;
    obtenerHistorialEntidad(tipo_entidad: string, id_entidad: number, limite?: number): Promise<HistorialCambios[]>;
    obtenerHistorialProyecto(id_proyecto: number, limite?: number): Promise<any[]>;
    obtenerEstadisticasHistorial(id_proyecto?: number): Promise<any>;
    restaurarVersion(tipo_entidad: string, id_entidad: number, id_historial: number, usuario: Usuario): Promise<any>;
    private detectarCamposModificados;
    private generarDescripcionAutomatica;
    private obtenerNombreEntidad;
    private restaurarProyecto;
}
