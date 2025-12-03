import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './certificado.entity';
import { CreateCertificadoDto } from './create-certificado.dto';
import { UpdateCertificadoDto } from './update-certificado.dto';

@Injectable()
export class CertificadoService {
  constructor(
    @InjectRepository(Certificado)
    private certificadoRepository: Repository<Certificado>,
  ) {}

  async create(createCertificadoDto: CreateCertificadoDto, userId: number): Promise<Certificado> {
    const codigo_verificacion = this.generateVerificationCode();
    
    const certificado = this.certificadoRepository.create({
      ...createCertificadoDto,
      codigo_verificacion,
      fecha_emision: new Date(createCertificadoDto.fecha_emision),
      fecha_expiracion: createCertificadoDto.fecha_expiracion 
        ? new Date(createCertificadoDto.fecha_expiracion) 
        : null,
    });

    return await this.certificadoRepository.save(certificado);
  }

  async findAll(): Promise<Certificado[]> {
    return await this.certificadoRepository.find({
      relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
      order: { fecha_emision: 'DESC' },
    });
  }

  async findByVolunteer(idVoluntario: number): Promise<Certificado[]> {
    return await this.certificadoRepository.find({
      where: { id_voluntario: idVoluntario },
      relations: ['proyecto'],
      order: { fecha_emision: 'DESC' },
    });
  }

  async findByProject(idProyecto: number): Promise<Certificado[]> {
    return await this.certificadoRepository.find({
      where: { id_proyecto: idProyecto },
      relations: ['voluntario', 'voluntario.usuario'],
      order: { fecha_emision: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Certificado> {
    const certificado = await this.certificadoRepository.findOne({
      where: { id_certificado: id },
      relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con ID ${id} no encontrado`);
    }

    return certificado;
  }

  async findByVerificationCode(codigo: string): Promise<Certificado> {
    const certificado = await this.certificadoRepository.findOne({
      where: { codigo_verificacion: codigo },
      relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
    });

    if (!certificado) {
      throw new NotFoundException(`Certificado con código ${codigo} no encontrado`);
    }

    return certificado;
  }

  async update(id: number, updateCertificadoDto: UpdateCertificadoDto): Promise<Certificado> {
    const certificado = await this.findOne(id);

    if (updateCertificadoDto.fecha_emision) {
      updateCertificadoDto.fecha_emision = new Date(updateCertificadoDto.fecha_emision).toISOString();
    }
    if (updateCertificadoDto.fecha_expiracion) {
      updateCertificadoDto.fecha_expiracion = new Date(updateCertificadoDto.fecha_expiracion).toISOString();
    }

    Object.assign(certificado, updateCertificadoDto);
    return await this.certificadoRepository.save(certificado);
  }

  async remove(id: number): Promise<void> {
    const certificado = await this.findOne(id);
    await this.certificadoRepository.remove(certificado);
  }

  private generateVerificationCode(): string {
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `CERT-${randomStr}-${timestamp}`;
  }
}

