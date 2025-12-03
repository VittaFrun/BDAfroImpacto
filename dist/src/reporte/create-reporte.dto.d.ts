export declare class CreateReporteDto {
    tipo: string;
    formato: 'PDF' | 'Excel' | 'CSV';
    id_proyecto: number;
    incluir_graficos?: boolean;
    incluir_detalles?: boolean;
    incluir_horas?: boolean;
    incluir_voluntarios?: boolean;
    fecha_inicio?: string;
    fecha_fin?: string;
    plantilla?: string;
}
