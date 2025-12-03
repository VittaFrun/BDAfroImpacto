import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizacion } from './organizacion.entity';
import { CreateOrganizacionDto } from './create-organizacion.dto';
import { UpdateOrganizacionDto } from './update-organizacion.dto';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Injectable()
export class OrganizacionService {
  constructor(
    @InjectRepository(Organizacion)
    private readonly repo: Repository<Organizacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
  ) {}

  async createBasic(id_usuario: number, nombre: string, tipo: string): Promise<Organizacion> {
    const usuario = await this.usuarioRepo.findOne({ where: { id_usuario } });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const organizacion = this.repo.create({
      usuario,
      nombre,
      tipo,
      sitio_web: '',
      pais: '',
      ciudad: '',
      areas_enfoque: '',
      mision_vision: '',
    });
    return this.repo.save(organizacion);
  }

  create(dto: CreateOrganizacionDto) {
    return this.repo.save(dto);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id_organizacion: id } });
  }

  async findByUserId(id_usuario: number) {
    return this.repo.findOne({ where: { id_usuario } });
  }

  update(id: number, dto: UpdateOrganizacionDto) {
    return this.repo.update(id, dto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  // Métodos públicos para perfiles
  async findPublicas() {
    // Devolver todas las organizaciones (no hay campo es_publico, todas son públicas por defecto)
    return this.repo.find({
      select: [
        'id_organizacion',
        'nombre',
        'nombre_corto',
        'tipo',
        'sitio_web',
        'pais',
        'ciudad',
        'descripcion',
        'areas_enfoque',
        'mision_vision',
        'logo',
        'banner',
        'color_primario',
        'color_secundario',
        'creado_en'
      ],
      order: { nombre: 'ASC' }
    });
  }

  async findPublico(id: number) {
    const organizacion = await this.repo.findOne({
      where: { id_organizacion: id },
      select: [
        'id_organizacion',
        'nombre',
        'nombre_corto',
        'tipo',
        'sitio_web',
        'pais',
        'ciudad',
        'descripcion',
        'areas_enfoque',
        'mision_vision',
        'logo',
        'banner',
        'color_primario',
        'color_secundario',
        'creado_en'
      ]
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return organizacion;
  }

  async findProyectosPublicos(id: number) {
    const organizacion = await this.repo.findOne({
      where: { id_organizacion: id }
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    }

    return this.proyectoRepo.find({
      where: {
        id_organizacion: id,
        es_publico: true
      },
      select: [
        'id_proyecto',
        'nombre',
        'descripcion',
        'objetivo',
        'ubicacion',
        'fecha_inicio',
        'fecha_fin',
        'imagen_principal',
        'presupuesto_total',
        'es_publico',
        'creado_en'
      ],
      order: { creado_en: 'DESC' }
    });
  }
}
