import { Repository } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './create-rol.dto';
import { UpdateRolDto } from './update-rol.dto';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Usuario } from '../users/user.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Permiso } from '../permiso/permiso.entity';
export declare class RolService {
    private readonly repo;
    private readonly orgRepo;
    private readonly proyectoRepo;
    private readonly asignacionRepo;
    private readonly permisoRepo;
    constructor(repo: Repository<Rol>, orgRepo: Repository<Organizacion>, proyectoRepo: Repository<Proyecto>, asignacionRepo: Repository<Asignacion>, permisoRepo: Repository<Permiso>);
    create(dto: CreateRolDto, user: Usuario): Promise<Rol>;
    findAll(filters?: {
        tipo_rol?: string;
        id_organizacion?: number;
        id_proyecto?: number;
    }): Promise<Rol[]>;
    findByOrganization(id_organizacion: number): Promise<Rol[]>;
    findByProject(id_proyecto: number): Promise<Rol[]>;
    findOne(id: number): Promise<Rol>;
    update(id: number, dto: UpdateRolDto, user: Usuario): Promise<Rol>;
    remove(id: number, user: Usuario): Promise<{
        message: string;
    }>;
    private validateTipoRol;
    private validatePermissions;
    private validateUpdatePermissions;
    private validateDeletePermissions;
    private findExistingRol;
    getPermisos(id: number): Promise<Permiso[]>;
    updatePermisos(id: number, permisosIds: number[], user: Usuario): Promise<Rol>;
}
