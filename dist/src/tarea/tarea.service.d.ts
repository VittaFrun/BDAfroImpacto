import { Repository } from 'typeorm';
import { Tarea } from './tarea.entity';
import { CreateTareaDto } from './create-tarea.dto';
import { UpdateTareaDto } from './update-tarea.dto';
import { Usuario } from '../users/user.entity';
import { Fase } from '../fase/fase.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
export declare class TareaService {
    private readonly repo;
    private readonly faseRepo;
    private readonly proyectoRepo;
    private readonly orgRepo;
    private readonly voluntarioRepo;
    private readonly asignacionRepo;
    private readonly horasRepo;
    constructor(repo: Repository<Tarea>, faseRepo: Repository<Fase>, proyectoRepo: Repository<Proyecto>, orgRepo: Repository<Organizacion>, voluntarioRepo: Repository<Voluntario>, asignacionRepo: Repository<Asignacion>, horasRepo: Repository<HorasVoluntariadas>);
    create(dto: CreateTareaDto, user: Usuario): Promise<Tarea>;
    findAllByProyecto(idProyecto: number): Promise<Tarea[]>;
    findOne(id: number): Promise<Tarea>;
    update(id: number, dto: UpdateTareaDto, user: Usuario): Promise<Tarea | import("typeorm").UpdateResult>;
    remove(id: number, user: Usuario): Promise<Tarea>;
    private checkOrganizacionOwnership;
}
