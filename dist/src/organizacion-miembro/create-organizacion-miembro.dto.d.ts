export declare class CreateOrganizacionMiembroDto {
    id_organizacion: number;
    id_voluntario: number;
    id_rol_organizacion?: number | null;
    estado?: 'pendiente' | 'activo' | 'inactivo';
    fecha_solicitud?: Date | null;
    fecha_aprobacion?: Date | null;
}
