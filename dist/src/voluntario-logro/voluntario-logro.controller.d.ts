import { VoluntarioLogroService } from './voluntario-logro.service';
import { CreateVoluntarioLogroDto } from './create-voluntario-logro.dto';
export declare class VoluntarioLogroController {
    private readonly voluntarioLogroService;
    constructor(voluntarioLogroService: VoluntarioLogroService);
    create(createVoluntarioLogroDto: CreateVoluntarioLogroDto): Promise<import("./voluntario-logro.entity").VoluntarioLogro>;
    findAll(idVoluntario?: number, idProyecto?: number): any[] | Promise<import("./voluntario-logro.entity").VoluntarioLogro[]>;
    getVolunteerPoints(idVoluntario: string): Promise<number>;
    findOne(id: string): Promise<import("./voluntario-logro.entity").VoluntarioLogro>;
    remove(id: string): Promise<void>;
}
