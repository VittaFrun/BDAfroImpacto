export declare class CreateRolDto {
    nombre: string;
    descripcion?: string;
    tipo_rol: 'organizacion' | 'proyecto';
    id_organizacion?: number;
    id_proyecto?: number;
    activo?: boolean;
    color?: string;
}
