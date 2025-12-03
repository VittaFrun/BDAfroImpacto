import { OrganizacionService } from './organizacion.service';
import { CreateOrganizacionDto } from './create-organizacion.dto';
import { UpdateOrganizacionDto } from './update-organizacion.dto';
export declare class OrganizacionController {
    private readonly service;
    constructor(service: OrganizacionService);
    create(dto: CreateOrganizacionDto): Promise<CreateOrganizacionDto & import("./organizacion.entity").Organizacion>;
    findAll(): Promise<import("./organizacion.entity").Organizacion[]>;
    findOne(id: string): Promise<import("./organizacion.entity").Organizacion>;
    update(id: string, dto: UpdateOrganizacionDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    findPublicas(): Promise<import("./organizacion.entity").Organizacion[]>;
    findPublico(id: number): Promise<import("./organizacion.entity").Organizacion>;
    findProyectosPublicos(id: number): Promise<import("../proyecto/proyecto.entity").Proyecto[]>;
}
