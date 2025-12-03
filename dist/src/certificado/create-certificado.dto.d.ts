export declare class CreateCertificadoDto {
    id_voluntario: number;
    id_proyecto?: number;
    nombre: string;
    descripcion: string;
    tipo: string;
    fecha_emision: string;
    fecha_expiracion?: string;
    archivo_pdf?: string;
}
