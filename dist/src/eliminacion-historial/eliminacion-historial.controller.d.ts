import { EliminacionHistorialService } from './eliminacion-historial.service';
import { Usuario } from '../users/user.entity';
export declare class EliminacionHistorialController {
    private readonly service;
    constructor(service: EliminacionHistorialService);
    findByProyecto(idProyecto: string): Promise<import("./eliminacion-historial.entity").EliminacionHistorial[]>;
    findByUsuario(user: Usuario): Promise<import("./eliminacion-historial.entity").EliminacionHistorial[]>;
    findByTipoEntidad(tipoEntidad: string, idProyecto?: string): Promise<import("./eliminacion-historial.entity").EliminacionHistorial[]>;
    findRecent(idProyecto?: string): Promise<import("./eliminacion-historial.entity").EliminacionHistorial[]>;
}
