import { TareaService } from './tarea.service';
import { CreateTareaDto } from './create-tarea.dto';
import { UpdateTareaDto } from './update-tarea.dto';
import { Usuario } from '../users/user.entity';
export declare class TareaController {
    private readonly service;
    constructor(service: TareaService);
    create(dto: CreateTareaDto, user: Usuario): Promise<import("./tarea.entity").Tarea>;
    findAllByProyecto(idProyecto: string): Promise<import("./tarea.entity").Tarea[]>;
    findOne(id: string): Promise<import("./tarea.entity").Tarea>;
    update(id: string, dto: UpdateTareaDto, user: Usuario): Promise<import("./tarea.entity").Tarea | import("typeorm").UpdateResult>;
    remove(id: string, user: Usuario): Promise<import("./tarea.entity").Tarea>;
}
