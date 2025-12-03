import { Repository } from 'typeorm';
import { Fase } from './fase.entity';
import { CreateFaseDto } from './create-fase.dto';
import { UpdateFaseDto } from './update-fase.dto';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
export declare class FaseService {
    private readonly repo;
    private readonly proyectoRepo;
    private readonly tareaRepo;
    constructor(repo: Repository<Fase>, proyectoRepo: Repository<Proyecto>, tareaRepo: Repository<Tarea>);
    create(dto: CreateFaseDto): Promise<Fase>;
    findAll(): Promise<Fase[]>;
    findOne(id: number): Promise<Fase>;
    update(id: number, dto: UpdateFaseDto): Promise<Fase>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    findByProject(projectId: number): Promise<Fase[]>;
    reorderPhases(projectId: number, newOrder: {
        id_fase: number;
        orden: number;
    }[]): Promise<Fase[]>;
}
