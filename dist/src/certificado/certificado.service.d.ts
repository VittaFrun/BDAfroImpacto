import { Repository } from 'typeorm';
import { Certificado } from './certificado.entity';
import { CreateCertificadoDto } from './create-certificado.dto';
import { UpdateCertificadoDto } from './update-certificado.dto';
export declare class CertificadoService {
    private certificadoRepository;
    constructor(certificadoRepository: Repository<Certificado>);
    create(createCertificadoDto: CreateCertificadoDto, userId: number): Promise<Certificado>;
    findAll(): Promise<Certificado[]>;
    findByVolunteer(idVoluntario: number): Promise<Certificado[]>;
    findByProject(idProyecto: number): Promise<Certificado[]>;
    findOne(id: number): Promise<Certificado>;
    findByVerificationCode(codigo: string): Promise<Certificado>;
    update(id: number, updateCertificadoDto: UpdateCertificadoDto): Promise<Certificado>;
    remove(id: number): Promise<void>;
    private generateVerificationCode;
}
