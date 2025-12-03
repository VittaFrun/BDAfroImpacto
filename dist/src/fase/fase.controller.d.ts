import { FaseService } from './fase.service';
import { CreateFaseDto } from './create-fase.dto';
import { UpdateFaseDto } from './update-fase.dto';
export declare class FaseController {
    private readonly service;
    constructor(service: FaseService);
    create(dto: CreateFaseDto): Promise<import("./fase.entity").Fase>;
    findAll(): Promise<import("./fase.entity").Fase[]>;
    findOne(id: string): Promise<import("./fase.entity").Fase>;
    update(id: string, dto: UpdateFaseDto): Promise<import("./fase.entity").Fase>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
