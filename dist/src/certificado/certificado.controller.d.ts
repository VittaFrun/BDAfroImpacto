import { CertificadoService } from './certificado.service';
import { CreateCertificadoDto } from './create-certificado.dto';
import { UpdateCertificadoDto } from './update-certificado.dto';
export declare class CertificadoController {
    private readonly certificadoService;
    constructor(certificadoService: CertificadoService);
    create(createCertificadoDto: CreateCertificadoDto, user: any): Promise<import("./certificado.entity").Certificado>;
    findAll(idVoluntario?: number, idProyecto?: number): Promise<import("./certificado.entity").Certificado[]>;
    findByVerificationCode(codigo: string): Promise<import("./certificado.entity").Certificado>;
    findOne(id: string): Promise<import("./certificado.entity").Certificado>;
    update(id: string, updateCertificadoDto: UpdateCertificadoDto): Promise<import("./certificado.entity").Certificado>;
    remove(id: string): Promise<void>;
}
