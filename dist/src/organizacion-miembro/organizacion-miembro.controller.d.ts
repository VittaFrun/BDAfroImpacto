import { OrganizacionMiembroService } from './organizacion-miembro.service';
import { UpdateOrganizacionMiembroDto } from './update-organizacion-miembro.dto';
import { Usuario } from '../users/user.entity';
export declare class OrganizacionMiembroController {
    private readonly service;
    constructor(service: OrganizacionMiembroService);
    findAllByOrganization(id: number, user: Usuario): Promise<import("./organizacion-miembro.entity").OrganizacionMiembro[]>;
    solicitarUnirse(id_organizacion: number, user: Usuario): Promise<import("./organizacion-miembro.entity").OrganizacionMiembro>;
    aprobarSolicitud(id_organizacion: number, miembroId: number, body: {
        id_rol_organizacion?: number;
    }, user: Usuario): Promise<import("./organizacion-miembro.entity").OrganizacionMiembro>;
    update(id_organizacion: number, miembroId: number, dto: UpdateOrganizacionMiembroDto, user: Usuario): Promise<import("./organizacion-miembro.entity").OrganizacionMiembro>;
    remove(id_organizacion: number, miembroId: number, user: Usuario): Promise<{
        message: string;
    }>;
}
