import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logro } from './logro.entity';
import { CreateLogroDto } from './create-logro.dto';
import { UpdateLogroDto } from './update-logro.dto';

@Injectable()
export class LogroService {
  constructor(
    @InjectRepository(Logro)
    private logroRepository: Repository<Logro>,
  ) {}

  async create(createLogroDto: CreateLogroDto): Promise<Logro> {
    const logro = this.logroRepository.create(createLogroDto);
    return await this.logroRepository.save(logro);
  }

  async findAll(): Promise<Logro[]> {
    return await this.logroRepository.find({
      relations: ['voluntarioLogros'],
      order: { creado_en: 'DESC' },
    });
  }

  async findByType(tipo: string): Promise<Logro[]> {
    return await this.logroRepository.find({
      where: { tipo },
      relations: ['voluntarioLogros'],
      order: { creado_en: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Logro> {
    const logro = await this.logroRepository.findOne({
      where: { id_logro: id },
      relations: ['voluntarioLogros'],
    });

    if (!logro) {
      throw new NotFoundException(`Logro con ID ${id} no encontrado`);
    }

    return logro;
  }

  async update(id: number, updateLogroDto: UpdateLogroDto): Promise<Logro> {
    const logro = await this.findOne(id);
    Object.assign(logro, updateLogroDto);
    return await this.logroRepository.save(logro);
  }

  async remove(id: number): Promise<void> {
    const logro = await this.findOne(id);
    await this.logroRepository.remove(logro);
  }
}

