import { Usuario } from '../users/user.entity';
import { Permiso } from '../permiso/permiso.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
export declare class Rol {
    id_rol: number;
    nombre: string;
    descripcion: string;
    tipo_rol: 'organizacion' | 'proyecto';
    id_organizacion: number | null;
    organizacion: Organizacion | null;
    id_proyecto: number | null;
    proyecto: Proyecto | null;
    activo: boolean;
    color: string;
    creado_por: number | null;
    creador: Usuario | null;
    creado_en: Date;
    actualizado_en: Date;
    usuarios: Usuario[];
    permisos: Permiso[];
}
