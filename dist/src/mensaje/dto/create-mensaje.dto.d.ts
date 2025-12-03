export declare enum TipoMensaje {
    TEXTO = "texto",
    IMAGEN = "imagen",
    ARCHIVO = "archivo",
    SISTEMA = "sistema"
}
export declare class CreateMensajeDto {
    id_destinatario: number;
    contenido: string;
    tipo?: TipoMensaje;
    archivo_url?: string;
    archivo_nombre?: string;
    archivo_tipo?: string;
    archivo_tamaño?: number;
    id_conversacion?: number;
}
