export declare class CreateComentarioDto {
    contenido: string;
    tipo_entidad: 'tarea' | 'proyecto' | 'fase';
    id_entidad: number;
    id_comentario_padre?: number;
    menciones?: number[];
    archivos_adjuntos?: Array<{
        nombre: string;
        url: string;
        tipo: string;
        tamaño: number;
    }>;
}
