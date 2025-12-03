import { LogroService } from './logro.service';
import { CreateLogroDto } from './create-logro.dto';
import { UpdateLogroDto } from './update-logro.dto';
export declare class LogroController {
    private readonly logroService;
    constructor(logroService: LogroService);
    create(createLogroDto: CreateLogroDto): Promise<import("./logro.entity").Logro>;
    findAll(tipo?: string): Promise<import("./logro.entity").Logro[]>;
    findOne(id: string): Promise<import("./logro.entity").Logro>;
    update(id: string, updateLogroDto: UpdateLogroDto): Promise<import("./logro.entity").Logro>;
    remove(id: string): Promise<void>;
}
