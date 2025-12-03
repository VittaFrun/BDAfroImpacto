import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './create-rol.dto';
import { UpdateRolDto } from './update-rol.dto';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Usuario } from '../users/user.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Permiso } from '../permiso/permiso.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly repo: Repository<Rol>,
    @InjectRepository(Organizacion)
    private readonly orgRepo: Repository<Organizacion>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Permiso)
    private readonly permisoRepo: Repository<Permiso>,
  ) {}

  async create(dto: CreateRolDto, user: Usuario) {
    if (!dto.nombre || !dto.nombre.trim()) {
      throw new BadRequestException('El nombre del rol es requerido');
    }

    // Validar tipo_rol y campos relacionados
    this.validateTipoRol(dto);

    // Validar permisos según tipo de rol
    await this.validatePermissions(dto, user);

    // Verificar si ya existe un rol con el mismo nombre en el mismo contexto
    const existingRol = await this.findExistingRol(dto);
    if (existingRol) {
      throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre.trim()}" en este contexto`);
    }

    // Validar y normalizar color
    let color = dto.color || '#2196F3';
    if (color && !color.startsWith('#')) {
      color = '#' + color;
    }
    // Validar formato hex
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(color)) {
      color = '#2196F3'; // Color por defecto si es inválido
    }

    const rol = this.repo.create({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || '',
      tipo_rol: dto.tipo_rol,
      id_organizacion: dto.tipo_rol === 'organizacion' ? dto.id_organizacion : null,
      id_proyecto: dto.tipo_rol === 'proyecto' ? dto.id_proyecto : null,
      activo: dto.activo !== undefined ? dto.activo : true,
      color: color.toUpperCase(),
      creado_por: user.id_usuario,
    });

    return this.repo.save(rol);
  }

  async findAll(filters?: { tipo_rol?: string; id_organizacion?: number; id_proyecto?: number }) {
    const where: any = {};
    
    if (filters?.tipo_rol) {
      where.tipo_rol = filters.tipo_rol;
    }
    if (filters?.id_organizacion) {
      where.id_organizacion = filters.id_organizacion;
    }
    if (filters?.id_proyecto) {
      where.id_proyecto = filters.id_proyecto;
    }

    return this.repo.find({
      where,
      order: { nombre: 'ASC' },
      relations: ['organizacion', 'proyecto', 'creador']
    });
  }

  async findByOrganization(id_organizacion: number) {
    // Solo roles de la organización
    return this.repo.find({
      where: {
        tipo_rol: 'organizacion',
        id_organizacion,
        activo: true
      },
      order: { nombre: 'ASC' },
      relations: ['organizacion']
    });
  }

  async findByProject(id_proyecto: number) {
    // Obtener el proyecto para saber su organización
    const proyecto = await this.proyectoRepo.findOne({
      where: { id_proyecto },
      relations: ['organizacion']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
    }

    // Roles de la organización + roles del proyecto
    return this.repo.find({
      where: [
        { tipo_rol: 'organizacion', id_organizacion: proyecto.id_organizacion, activo: true },
        { tipo_rol: 'proyecto', id_proyecto, activo: true }
      ],
      order: { tipo_rol: 'ASC', nombre: 'ASC' },
      relations: ['organizacion', 'proyecto']
    });
  }

  async findOne(id: number) {
    const rol = await this.repo.findOne({ 
      where: { id_rol: id },
      relations: ['organizacion', 'proyecto', 'creador']
    });
    
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  async update(id: number, dto: UpdateRolDto, user: Usuario) {
    const rol = await this.findOne(id);

    // Validar permisos para modificar
    await this.validateUpdatePermissions(rol, user);

    // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre en el mismo contexto
    if (dto.nombre && dto.nombre.trim() !== rol.nombre) {
      if (!dto.nombre.trim()) {
        throw new BadRequestException('El nombre del rol no puede estar vacío');
      }

      const existingRol = await this.findExistingRol({
        nombre: dto.nombre,
        tipo_rol: rol.tipo_rol,
        id_organizacion: rol.id_organizacion,
        id_proyecto: rol.id_proyecto
      } as CreateRolDto);

      if (existingRol && existingRol.id_rol !== id) {
        throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre.trim()}" en este contexto`);
      }
    }

    // Actualizar campos
    if (dto.nombre !== undefined) {
      rol.nombre = dto.nombre.trim();
    }
    if (dto.descripcion !== undefined) {
      rol.descripcion = dto.descripcion.trim();
    }
    if (dto.activo !== undefined) {
      rol.activo = dto.activo;
    }
    if (dto.color !== undefined) {
      // Validar y normalizar color
      let color = dto.color;
      if (color && !color.startsWith('#')) {
        color = '#' + color;
      }
      // Validar formato hex
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (hexRegex.test(color)) {
        rol.color = color.toUpperCase();
      } else {
        // Si el color es inválido, mantener el actual o usar el por defecto
        rol.color = rol.color || '#2196F3';
      }
    }

    return this.repo.save(rol);
  }

  async remove(id: number, user: Usuario) {
    const rol = await this.findOne(id);

    // Validar permisos para eliminar
    await this.validateDeletePermissions(rol, user);

    // Verificar que el rol no esté en uso
    const asignaciones = await this.asignacionRepo.find({
      where: { id_rol: id }
    });

    if (asignaciones.length > 0) {
      throw new ConflictException(`No se puede eliminar el rol porque está siendo usado en ${asignaciones.length} asignación(es)`);
    }

    await this.repo.remove(rol);
    return { message: 'Rol eliminado correctamente' };
  }

  // Métodos privados de validación
  private validateTipoRol(dto: CreateRolDto) {
    if (dto.tipo_rol === 'organizacion') {
      if (!dto.id_organizacion) {
        throw new BadRequestException('Los roles de organización requieren id_organizacion');
      }
      if (dto.id_proyecto) {
        throw new BadRequestException('Los roles de organización no pueden tener id_proyecto');
      }
    }

    if (dto.tipo_rol === 'proyecto') {
      if (!dto.id_proyecto) {
        throw new BadRequestException('Los roles de proyecto requieren id_proyecto');
      }
      if (dto.id_organizacion) {
        throw new BadRequestException('Los roles de proyecto no pueden tener id_organizacion');
      }
    }
  }

  private async validatePermissions(dto: CreateRolDto, user: Usuario | any) {
    // El usuario del JWT puede venir con 'id' o 'id_usuario'
    // Normalizar para obtener el id_usuario correcto
    const userId = (user as any).id_usuario || (user as any).id;
    const userType = user.tipo_usuario;

    if (!userId) {
      console.error(`[RolService] Usuario sin id_usuario válido:`, user);
      throw new ForbiddenException('Error al verificar la identidad del usuario');
    }

    // Admin puede crear cualquier tipo de rol
    if (userType === 'admin') {
      return;
    }

    // Organización solo puede crear roles de organización y proyecto
    if (userType === 'organizacion') {
      // Validar que la organización es propietaria
      if (dto.tipo_rol === 'organizacion') {
        const org = await this.orgRepo.findOne({ where: { id_organizacion: dto.id_organizacion, id_usuario: userId } });
        if (!org) {
          throw new ForbiddenException('No tienes permiso para crear roles para esta organización');
        }
      }

      if (dto.tipo_rol === 'proyecto') {
        if (!dto.id_proyecto) {
          throw new ForbiddenException('El proyecto es requerido para roles de proyecto');
        }
        
        // Buscar el proyecto con la relación de organización
        const proyecto = await this.proyectoRepo.findOne({ 
          where: { id_proyecto: dto.id_proyecto },
          relations: ['organizacion']
        });
        
        if (!proyecto) {
          throw new ForbiddenException('El proyecto especificado no existe');
        }
        
        // Obtener la organización del proyecto (ya sea desde la relación o directamente)
        let organizacion = proyecto.organizacion;
        if (!organizacion && proyecto.id_organizacion) {
          organizacion = await this.orgRepo.findOne({ 
            where: { id_organizacion: proyecto.id_organizacion }
          });
        }
        
        if (!organizacion) {
          console.error(`[RolService] No se encontró la organización para el proyecto ${dto.id_proyecto}. id_organizacion del proyecto: ${proyecto.id_organizacion}`);
          throw new ForbiddenException('No se pudo verificar la organización del proyecto');
        }
        
        // Verificar que el usuario de la organización coincida con el usuario autenticado
        // Normalizar ambos a números para comparación segura
        const organizacionUserId = Number(organizacion.id_usuario);
        const authenticatedUserId = Number(userId);
        
        if (organizacionUserId !== authenticatedUserId) {
          console.error(`[RolService] Permiso denegado. Usuario autenticado: ${authenticatedUserId}, Usuario de la organización: ${organizacionUserId}, Proyecto: ${dto.id_proyecto}`);
          throw new ForbiddenException('No tienes permiso para crear roles para este proyecto');
        }
      }
    } else {
      throw new ForbiddenException('Solo administradores y organizaciones pueden crear roles');
    }
  }

  private async validateUpdatePermissions(rol: Rol, user: Usuario) {
    if (user.tipo_usuario === 'admin') {
      return;
    }

    if (user.tipo_usuario === 'organizacion') {
      if (rol.tipo_rol === 'organizacion' && rol.id_organizacion) {
        const org = await this.orgRepo.findOne({ where: { id_organizacion: rol.id_organizacion, id_usuario: user.id_usuario } });
        if (!org) {
          throw new ForbiddenException('No tienes permiso para modificar este rol');
        }
      } else if (rol.tipo_rol === 'proyecto' && rol.id_proyecto) {
        const proyecto = await this.proyectoRepo.findOne({ 
          where: { id_proyecto: rol.id_proyecto },
          relations: ['organizacion']
        });
        if (!proyecto || proyecto.organizacion.id_usuario !== user.id_usuario) {
          throw new ForbiddenException('No tienes permiso para modificar este rol');
        }
      }
    } else {
      throw new ForbiddenException('No tienes permiso para modificar roles');
    }
  }

  private async validateDeletePermissions(rol: Rol, user: Usuario) {
    if (user.tipo_usuario === 'admin') {
      return;
    }

    if (user.tipo_usuario === 'organizacion') {
      if (rol.tipo_rol === 'organizacion' && rol.id_organizacion) {
        const org = await this.orgRepo.findOne({ where: { id_organizacion: rol.id_organizacion, id_usuario: user.id_usuario } });
        if (!org) {
          throw new ForbiddenException('No tienes permiso para eliminar este rol');
        }
      } else if (rol.tipo_rol === 'proyecto' && rol.id_proyecto) {
        const proyecto = await this.proyectoRepo.findOne({ 
          where: { id_proyecto: rol.id_proyecto },
          relations: ['organizacion']
        });
        if (!proyecto || proyecto.organizacion.id_usuario !== user.id_usuario) {
          throw new ForbiddenException('No tienes permiso para eliminar este rol');
        }
      }
    } else {
      throw new ForbiddenException('No tienes permiso para eliminar roles');
    }
  }

  private async findExistingRol(dto: CreateRolDto): Promise<Rol | null> {
    const where: any = {
      nombre: dto.nombre.trim(),
      tipo_rol: dto.tipo_rol
    };

    if (dto.tipo_rol === 'organizacion') {
      where.id_organizacion = dto.id_organizacion;
    } else if (dto.tipo_rol === 'proyecto') {
      where.id_proyecto = dto.id_proyecto;
    }

    return this.repo.findOne({ where });
  }

  // Métodos para gestionar permisos
  async getPermisos(id: number) {
    const rol = await this.findOne(id);
    return this.repo.findOne({
      where: { id_rol: id },
      relations: ['permisos']
    }).then(r => r?.permisos || []);
  }

  async updatePermisos(id: number, permisosIds: number[], user: Usuario) {
    const rol = await this.findOne(id);

    // Validar que el rol es de organización (solo estos pueden tener permisos)
    if (rol.tipo_rol !== 'organizacion') {
      throw new BadRequestException('Solo los roles de organización pueden tener permisos');
    }

    // Validar permisos para modificar
    await this.validateUpdatePermissions(rol, user);

    // Validar que todos los permisos existen
    const permisos = await this.permisoRepo.find({
      where: { id_permiso: In(permisosIds) }
    });
    if (permisos.length !== permisosIds.length) {
      throw new BadRequestException('Algunos permisos no existen');
    }

    // Actualizar permisos del rol
    rol.permisos = permisos;
    return this.repo.save(rol);
  }
}
