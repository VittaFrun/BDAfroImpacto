export declare class CreateProyectoDto {
    nombre: string;
    descripcion: string;
    objetivo: string;
    ubicacion: string;
    fecha_inicio: string;
    fecha_fin: string;
    imagen_principal?: string;
    banner?: string;
    documento?: string;
    presupuesto_total?: number;
    id_estado?: number;
    es_publico?: boolean;
    categoria?: string;
    requisitos?: string;
}
