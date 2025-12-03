import { HistorialCambiosService } from './historial-cambios.service';
export declare class HistorialCambiosController {
    private readonly historialService;
    constructor(historialService: HistorialCambiosService);
    getEntityHistory(tipo: string, id: number, limite?: string): Promise<import("./historial-cambios.entity").HistorialCambios[]>;
    getProjectHistory(id: number, limite?: string): Promise<any[]>;
    getHistoryStats(proyecto?: string): Promise<any>;
    restoreVersion(body: {
        tipo_entidad: string;
        id_entidad: number;
        id_historial: number;
    }, req: any): Promise<any>;
}
