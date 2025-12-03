import { Repository } from 'typeorm';
import { Job } from 'bull';
import { Reporte } from './reporte.entity';
import { ReporteGeneratorService } from './reporte-generator.service';
import { Usuario } from '../users/user.entity';
export declare class ReporteProcessor {
    private readonly reporteRepo;
    private readonly usuarioRepo;
    private readonly reporteGenerator;
    private readonly logger;
    constructor(reporteRepo: Repository<Reporte>, usuarioRepo: Repository<Usuario>, reporteGenerator: ReporteGeneratorService);
    handleReportGeneration(job: Job): Promise<void>;
    private saveReportFile;
}
