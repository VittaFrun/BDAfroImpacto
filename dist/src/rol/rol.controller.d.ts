import { RolService } from './rol.service';
import { CreateRolDto } from './create-rol.dto';
import { UpdateRolDto } from './update-rol.dto';
import { Usuario } from '../users/user.entity';
export declare class RolController {
    private readonly service;
    constructor(service: RolService);
    create(dto: CreateRolDto, user: Usuario): Promise<import("./rol.entity").Rol>;
    findAll(tipo_rol?: string, id_organizacion?: string, id_proyecto?: string): Promise<import("./rol.entity").Rol[]>;
    findByOrganization(id: number): Promise<import("./rol.entity").Rol[]>;
    findByProject(id: number): Promise<import("./rol.entity").Rol[]>;
    findOne(id: number): Promise<import("./rol.entity").Rol>;
    update(id: number, dto: UpdateRolDto, user: Usuario): Promise<import("./rol.entity").Rol>;
    remove(id: number, user: Usuario): Promise<{
        message: string;
    }>;
    getPermisos(id: number): Promise<import("../permiso/permiso.entity").Permiso[]>;
    updatePermisos(id: number, body: {
        permisos: number[];
    }, user: Usuario): Promise<import("./rol.entity").Rol>;
}
