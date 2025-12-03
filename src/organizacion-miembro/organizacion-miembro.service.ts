import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionMiembro } from './organizacion-miembro.entity';
import { CreateOrganizacionMiembroDto } from './create-organizacion-miembro.dto';
import { UpdateOrganizacionMiembroDto } from './update-organizacion-miembro.dto';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { Usuario } from '../users/user.entity';

@Injectable()
export class OrganizacionMiembroService {
  constructor(
    @InjectRepository(OrganizacionMiembro)
    private readonly repo: Repository<OrganizacionMiembro>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  async create(dto: CreateOrganizacionMiembroDto, user: Usuario) {
    // Validar que la organización existe
    const organizacion = await this.orgRepo.findOne({
      where: { id_organizacion: dto.id_organizacion }
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${dto.id_organizacion} no encontrada`);
    }

    // Validar que el voluntario existe
    const voluntario = await this.voluntarioRepo.findOne({
      where: { id_voluntario: dto.id_voluntario }
    });

    if (!voluntario) {
      throw new NotFoundException(`Voluntario con ID ${dto.id_voluntario} no encontrado`);
    }

    // Verificar si ya existe una relación
    const existing = await this.repo.findOne({
      where: {
        id_organizacion: dto.id_organizacion,
        id_voluntario: dto.id_voluntario
      }
    });

    if (existing) {
      throw new ConflictException('El voluntario ya es miembro de esta organización');
    }

    // Validar rol si se proporciona
    if (dto.id_rol_organizacion) {
      const rol = await this.rolRepo.findOne({
        where: { id_rol: dto.id_rol_organizacion }
      });

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${dto.id_rol_organizacion} no encontrado`);
      }

      if (rol.tipo_rol !== 'organizacion' || rol.id_organizacion !== dto.id_organizacion) {
        throw new BadRequestException('El rol debe ser un rol de organización válido para esta organización');
      }
    }

    const miembro = this.repo.create({
      id_organizacion: dto.id_organizacion,
      id_voluntario: dto.id_voluntario,
      id_rol_organizacion: dto.id_rol_organizacion || null,
      estado: dto.estado || 'pendiente',
      fecha_solicitud: dto.fecha_solicitud ? new Date(dto.fecha_solicitud) : new Date(),
      fecha_aprobacion: dto.fecha_aprobacion ? new Date(dto.fecha_aprobacion) : null
    });

    return this.repo.save(miembro);
  }

  async findAllByOrganization(id_organizacion: number, user?: Usuario) {
    // Validar que la organización existe
    const organizacion = await this.orgRepo.findOne({
      where: { id_organizacion }
    });

    if (!organizacion) {
      throw new NotFoundException(`Organización con ID ${id_organizacion} no encontrada`);
    }

    // Si hay usuario, validar permisos (solo el dueño de la organización puede ver todos)
    if (user && user.tipo_usuario === 'organizacion') {
      if (organizacion.id_usuario !== user.id_usuario) {
        throw new ForbiddenException('No tienes permiso para ver los miembros de esta organización');
      }
    }

    return this.repo.find({
      where: { id_organizacion },
      relations: ['voluntario', 'voluntario.usuario', 'rol_organizacion'],
      order: { creado_en: 'DESC' }
    });
  }

  async findOne(id: number, user?: Usuario) {
    const miembro = await this.repo.findOne({
      where: { id_miembro: id },
      relations: ['organizacion', 'voluntario', 'voluntario.usuario', 'rol_organizacion']
    });

    if (!miembro) {
      throw new NotFoundException(`Miembro con ID ${id} no encontrado`);
    }

    // Validar permisos
    if (user && user.tipo_usuario === 'organizacion') {
      const organizacion = await this.orgRepo.findOne({
        where: { id_organizacion: miembro.id_organizacion }
      });

      if (organizacion && organizacion.id_usuario !== user.id_usuario) {
        throw new ForbiddenException('No tienes permiso para ver este miembro');
      }
    }

    return miembro;
  }

  async update(id: number, dto: UpdateOrganizacionMiembroDto, user: Usuario) {
    const miembro = await this.findOne(id, user);

    // Validar que el usuario es dueño de la organización
    const organizacion = await this.orgRepo.findOne({
      where: { id_organizacion: miembro.id_organizacion }
    });

    if (user.tipo_usuario === 'organizacion' && organizacion.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tienes permiso para actualizar este miembro');
    }

    // Validar rol si se proporciona
    if (dto.id_rol_organizacion !== undefined) {
      if (dto.id_rol_organizacion !== null) {
        const rol = await this.rolRepo.findOne({
          where: { id_rol: dto.id_rol_organizacion }
        });

        if (!rol) {
          throw new NotFoundException(`Rol con ID ${dto.id_rol_organizacion} no encontrado`);
        }

        if (rol.tipo_rol !== 'organizacion' || rol.id_organizacion !== miembro.id_organizacion) {
          throw new BadRequestException('El rol debe ser un rol de organización válido para esta organización');
        }
      }
      miembro.id_rol_organizacion = dto.id_rol_organizacion;
    }

    if (dto.estado !== undefined) {
      miembro.estado = dto.estado;
      
      // Si se aprueba, establecer fecha de aprobación
      if (dto.estado === 'activo' && miembro.fecha_aprobacion === null) {
        miembro.fecha_aprobacion = new Date();
      }
    }

    if (dto.fecha_aprobacion !== undefined) {
      miembro.fecha_aprobacion = dto.fecha_aprobacion ? new Date(dto.fecha_aprobacion) : null;
    }

    return this.repo.save(miembro);
  }

  async remove(id: number, user: Usuario) {
    const miembro = await this.findOne(id, user);

    // Validar que el usuario es dueño de la organización
    const organizacion = await this.orgRepo.findOne({
      where: { id_organizacion: miembro.id_organizacion }
    });

    if (user.tipo_usuario === 'organizacion' && organizacion.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tienes permiso para eliminar este miembro');
    }

    await this.repo.remove(miembro);
    return { message: 'Miembro eliminado correctamente' };
  }

  async solicitarUnirse(id_organizacion: number, id_usuario: number) {
    // Obtener el voluntario desde el usuario
    const voluntario = await this.voluntarioRepo.findOne({
      where: { id_usuario }
    });

    if (!voluntario) {
      throw new NotFoundException('No se encontró un perfil de voluntario para este usuario');
    }

    const id_voluntario = voluntario.id_voluntario;
    // Verificar si ya existe una solicitud o membresía
    const existing = await this.repo.findOne({
      where: {
        id_organizacion,
        id_voluntario
      }
    });

    if (existing) {
      if (existing.estado === 'pendiente') {
        throw new ConflictException('Ya existe una solicitud pendiente para esta organización');
      }
      if (existing.estado === 'activo') {
        throw new ConflictException('Ya eres miembro activo de esta organización');
      }
    }

    const dto: CreateOrganizacionMiembroDto = {
      id_organizacion,
      id_voluntario,
      estado: 'pendiente',
      fecha_solicitud: new Date()
    };

    return this.create(dto, null as any); // No hay usuario en solicitud voluntaria
  }

  async aprobarSolicitud(id_miembro: number, id_rol_organizacion: number | null, user: Usuario) {
    const miembro = await this.findOne(id_miembro, user);

    if (miembro.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');
    }

    const updateDto: UpdateOrganizacionMiembroDto = {
      estado: 'activo',
      id_rol_organizacion: id_rol_organizacion || null,
      fecha_aprobacion: new Date()
    };

    return this.update(id_miembro, updateDto, user);
  }
}

