import { Repository } from 'typeorm';
import { Organizacion } from './organizacion.entity';
import { CreateOrganizacionDto } from './create-organizacion.dto';
import { UpdateOrganizacionDto } from './update-organizacion.dto';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
export declare class OrganizacionService {
    private readonly repo;
    private readonly usuarioRepo;
    private readonly proyectoRepo;
    constructor(repo: Repository<Organizacion>, usuarioRepo: Repository<Usuario>, proyectoRepo: Repository<Proyecto>);
    createBasic(id_usuario: number, nombre: string, tipo: string): Promise<Organizacion>;
    create(dto: CreateOrganizacionDto): Promise<CreateOrganizacionDto & Organizacion>;
    findAll(): Promise<Organizacion[]>;
    findOne(id: number): Promise<Organizacion>;
    findByUserId(id_usuario: number): Promise<Organizacion>;
    update(id: number, dto: UpdateOrganizacionDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    findPublicas(): Promise<Organizacion[]>;
    findPublico(id: number): Promise<Organizacion>;
    findProyectosPublicos(id: number): Promise<Proyecto[]>;
}
