import { Repository } from 'typeorm';
import { EliminacionHistorial } from './eliminacion-historial.entity';
import { Usuario } from '../users/user.entity';
export interface RegistroEliminacionDto {
    tipo_entidad: string;
    id_entidad: number;
    nombre_entidad?: string;
    descripcion?: string;
    id_proyecto?: number;
    razon?: string;
    datos_adicionales?: any;
}
export declare class EliminacionHistorialService {
    private readonly repo;
    constructor(repo: Repository<EliminacionHistorial>);
    registrarEliminacion(dto: RegistroEliminacionDto, usuario: Usuario): Promise<EliminacionHistorial>;
    findByProyecto(id_proyecto: number): Promise<EliminacionHistorial[]>;
    findByUsuario(id_usuario: number): Promise<EliminacionHistorial[]>;
    findByTipoEntidad(tipo_entidad: string, id_proyecto?: number): Promise<EliminacionHistorial[]>;
    findRecent(id_proyecto?: number): Promise<EliminacionHistorial[]>;
}
