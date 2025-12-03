import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
export declare class OrganizacionMiembro {
    id_miembro: number;
    id_organizacion: number;
    organizacion: Organizacion;
    id_voluntario: number;
    voluntario: Voluntario;
    id_rol_organizacion: number | null;
    rol_organizacion: Rol | null;
    estado: 'pendiente' | 'activo' | 'inactivo';
    fecha_solicitud: Date | null;
    fecha_aprobacion: Date | null;
    creado_en: Date;
    actualizado_en: Date;
}
