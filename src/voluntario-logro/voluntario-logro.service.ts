import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoluntarioLogro } from './voluntario-logro.entity';
import { CreateVoluntarioLogroDto } from './create-voluntario-logro.dto';

@Injectable()
export class VoluntarioLogroService {
  constructor(
    @InjectRepository(VoluntarioLogro)
    private voluntarioLogroRepository: Repository<VoluntarioLogro>,
  ) {}

  async create(createVoluntarioLogroDto: CreateVoluntarioLogroDto): Promise<VoluntarioLogro> {
    const voluntarioLogro = this.voluntarioLogroRepository.create({
      ...createVoluntarioLogroDto,
      fecha_obtenido: createVoluntarioLogroDto.fecha_obtenido 
        ? new Date(createVoluntarioLogroDto.fecha_obtenido) 
        : new Date(),
    });

    return await this.voluntarioLogroRepository.save(voluntarioLogro);
  }

  async findByVolunteer(idVoluntario: number): Promise<VoluntarioLogro[]> {
    return await this.voluntarioLogroRepository.find({
      where: { id_voluntario: idVoluntario },
      relations: ['logro', 'proyecto'],
      order: { fecha_obtenido: 'DESC' },
    });
  }

  async findByProject(idProyecto: number): Promise<VoluntarioLogro[]> {
    return await this.voluntarioLogroRepository.find({
      where: { proyecto_relacionado: idProyecto },
      relations: ['voluntario', 'voluntario.usuario', 'logro'],
      order: { fecha_obtenido: 'DESC' },
    });
  }

  async findOne(id: number): Promise<VoluntarioLogro> {
    const voluntarioLogro = await this.voluntarioLogroRepository.findOne({
      where: { id_voluntario_logro: id },
      relations: ['voluntario', 'voluntario.usuario', 'logro', 'proyecto'],
    });

    if (!voluntarioLogro) {
      throw new NotFoundException(`Logro de voluntario con ID ${id} no encontrado`);
    }

    return voluntarioLogro;
  }

  async remove(id: number): Promise<void> {
    const voluntarioLogro = await this.findOne(id);
    await this.voluntarioLogroRepository.remove(voluntarioLogro);
  }

  async getVolunteerPoints(idVoluntario: number): Promise<number> {
    const logros = await this.findByVolunteer(idVoluntario);
    return logros.reduce((total, vl) => total + (vl.logro?.puntos || 0), 0);
  }
}

