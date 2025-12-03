import { Repository } from 'typeorm';
import { VoluntarioLogro } from './voluntario-logro.entity';
import { CreateVoluntarioLogroDto } from './create-voluntario-logro.dto';
export declare class VoluntarioLogroService {
    private voluntarioLogroRepository;
    constructor(voluntarioLogroRepository: Repository<VoluntarioLogro>);
    create(createVoluntarioLogroDto: CreateVoluntarioLogroDto): Promise<VoluntarioLogro>;
    findByVolunteer(idVoluntario: number): Promise<VoluntarioLogro[]>;
    findByProject(idProyecto: number): Promise<VoluntarioLogro[]>;
    findOne(id: number): Promise<VoluntarioLogro>;
    remove(id: number): Promise<void>;
    getVolunteerPoints(idVoluntario: number): Promise<number>;
}
