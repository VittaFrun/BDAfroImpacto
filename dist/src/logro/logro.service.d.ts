import { Repository } from 'typeorm';
import { Logro } from './logro.entity';
import { CreateLogroDto } from './create-logro.dto';
import { UpdateLogroDto } from './update-logro.dto';
export declare class LogroService {
    private logroRepository;
    constructor(logroRepository: Repository<Logro>);
    create(createLogroDto: CreateLogroDto): Promise<Logro>;
    findAll(): Promise<Logro[]>;
    findByType(tipo: string): Promise<Logro[]>;
    findOne(id: number): Promise<Logro>;
    update(id: number, updateLogroDto: UpdateLogroDto): Promise<Logro>;
    remove(id: number): Promise<void>;
}
