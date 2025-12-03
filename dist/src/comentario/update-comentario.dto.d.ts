export declare class UpdateComentarioDto {
    contenido?: string;
    menciones?: number[];
    archivos_adjuntos?: Array<{
        nombre: string;
        url: string;
        tipo: string;
        tamaño: number;
    }>;
}
