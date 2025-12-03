import { Proyecto } from '../proyecto/proyecto.entity';
export declare class Reporte {
    id_reporte: number;
    tipo: string;
    formato: 'PDF' | 'Excel' | 'CSV';
    estado: 'pendiente' | 'generando' | 'listo' | 'error';
    id_proyecto: number;
    contenido: string;
    incluir_graficos: boolean;
    descargas: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    creado_en: Date;
    actualizado_en: Date;
    proyecto: Proyecto;
}
