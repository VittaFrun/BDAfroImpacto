import { Repository } from 'typeorm';
import { OrganizacionMiembro } from './organizacion-miembro.entity';
import { CreateOrganizacionMiembroDto } from './create-organizacion-miembro.dto';
import { UpdateOrganizacionMiembroDto } from './update-organizacion-miembro.dto';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { Usuario } from '../users/user.entity';
export declare class OrganizacionMiembroService {
    private readonly repo;
    private readonly orgRepo;
    private readonly voluntarioRepo;
    private readonly rolRepo;
    constructor(repo: Repository<OrganizacionMiembro>, orgRepo: Repository<Organizacion>, voluntarioRepo: Repository<Voluntario>, rolRepo: Repository<Rol>);
    create(dto: CreateOrganizacionMiembroDto, user: Usuario): Promise<OrganizacionMiembro>;
    findAllByOrganization(id_organizacion: number, user?: Usuario): Promise<OrganizacionMiembro[]>;
    findOne(id: number, user?: Usuario): Promise<OrganizacionMiembro>;
    update(id: number, dto: UpdateOrganizacionMiembroDto, user: Usuario): Promise<OrganizacionMiembro>;
    remove(id: number, user: Usuario): Promise<{
        message: string;
    }>;
    solicitarUnirse(id_organizacion: number, id_usuario: number): Promise<OrganizacionMiembro>;
    aprobarSolicitud(id_miembro: number, id_rol_organizacion: number | null, user: Usuario): Promise<OrganizacionMiembro>;
}
