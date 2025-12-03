"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rol_entity_1 = require("./rol.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const permiso_entity_1 = require("../permiso/permiso.entity");
let RolService = class RolService {
    constructor(repo, orgRepo, proyectoRepo, asignacionRepo, permisoRepo) {
        this.repo = repo;
        this.orgRepo = orgRepo;
        this.proyectoRepo = proyectoRepo;
        this.asignacionRepo = asignacionRepo;
        this.permisoRepo = permisoRepo;
    }
    async create(dto, user) {
        var _a;
        if (!dto.nombre || !dto.nombre.trim()) {
            throw new common_1.BadRequestException('El nombre del rol es requerido');
        }
        this.validateTipoRol(dto);
        await this.validatePermissions(dto, user);
        const existingRol = await this.findExistingRol(dto);
        if (existingRol) {
            throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.nombre.trim()}" en este contexto`);
        }
        let color = dto.color || '#2196F3';
        if (color && !color.startsWith('#')) {
            color = '#' + color;
        }
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(color)) {
            color = '#2196F3';
        }
        const rol = this.repo.create({
            nombre: dto.nombre.trim(),
            descripcion: ((_a = dto.descripcion) === null || _a === void 0 ? void 0 : _a.trim()) || '',
            tipo_rol: dto.tipo_rol,
            id_organizacion: dto.tipo_rol === 'organizacion' ? dto.id_organizacion : null,
            id_proyecto: dto.tipo_rol === 'proyecto' ? dto.id_proyecto : null,
            activo: dto.activo !== undefined ? dto.activo : true,
            color: color.toUpperCase(),
            creado_por: user.id_usuario,
        });
        return this.repo.save(rol);
    }
    async findAll(filters) {
        const where = {};
        if (filters === null || filters === void 0 ? void 0 : filters.tipo_rol) {
            where.tipo_rol = filters.tipo_rol;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.id_organizacion) {
            where.id_organizacion = filters.id_organizacion;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.id_proyecto) {
            where.id_proyecto = filters.id_proyecto;
        }
        return this.repo.find({
            where,
            order: { nombre: 'ASC' },
            relations: ['organizacion', 'proyecto', 'creador']
        });
    }
    async findByOrganization(id_organizacion) {
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
    async findByProject(id_proyecto) {
        const proyecto = await this.proyectoRepo.findOne({
            where: { id_proyecto },
            relations: ['organizacion']
        });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
        }
        return this.repo.find({
            where: [
                { tipo_rol: 'organizacion', id_organizacion: proyecto.id_organizacion, activo: true },
                { tipo_rol: 'proyecto', id_proyecto, activo: true }
            ],
            order: { tipo_rol: 'ASC', nombre: 'ASC' },
            relations: ['organizacion', 'proyecto']
        });
    }
    async findOne(id) {
        const rol = await this.repo.findOne({
            where: { id_rol: id },
            relations: ['organizacion', 'proyecto', 'creador']
        });
        if (!rol) {
            throw new common_1.NotFoundException(`Rol con ID ${id} no encontrado`);
        }
        return rol;
    }
    async update(id, dto, user) {
        const rol = await this.findOne(id);
        await this.validateUpdatePermissions(rol, user);
        if (dto.nombre && dto.nombre.trim() !== rol.nombre) {
            if (!dto.nombre.trim()) {
                throw new common_1.BadRequestException('El nombre del rol no puede estar vacío');
            }
            const existingRol = await this.findExistingRol({
                nombre: dto.nombre,
                tipo_rol: rol.tipo_rol,
                id_organizacion: rol.id_organizacion,
                id_proyecto: rol.id_proyecto
            });
            if (existingRol && existingRol.id_rol !== id) {
                throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.nombre.trim()}" en este contexto`);
            }
        }
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
            let color = dto.color;
            if (color && !color.startsWith('#')) {
                color = '#' + color;
            }
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (hexRegex.test(color)) {
                rol.color = color.toUpperCase();
            }
            else {
                rol.color = rol.color || '#2196F3';
            }
        }
        return this.repo.save(rol);
    }
    async remove(id, user) {
        const rol = await this.findOne(id);
        await this.validateDeletePermissions(rol, user);
        const asignaciones = await this.asignacionRepo.find({
            where: { id_rol: id }
        });
        if (asignaciones.length > 0) {
            throw new common_1.ConflictException(`No se puede eliminar el rol porque está siendo usado en ${asignaciones.length} asignación(es)`);
        }
        await this.repo.remove(rol);
        return { message: 'Rol eliminado correctamente' };
    }
    validateTipoRol(dto) {
        if (dto.tipo_rol === 'organizacion') {
            if (!dto.id_organizacion) {
                throw new common_1.BadRequestException('Los roles de organización requieren id_organizacion');
            }
            if (dto.id_proyecto) {
                throw new common_1.BadRequestException('Los roles de organización no pueden tener id_proyecto');
            }
        }
        if (dto.tipo_rol === 'proyecto') {
            if (!dto.id_proyecto) {
                throw new common_1.BadRequestException('Los roles de proyecto requieren id_proyecto');
            }
            if (dto.id_organizacion) {
                throw new common_1.BadRequestException('Los roles de proyecto no pueden tener id_organizacion');
            }
        }
    }
    async validatePermissions(dto, user) {
        const userId = user.id_usuario || user.id;
        const userType = user.tipo_usuario;
        if (!userId) {
            console.error(`[RolService] Usuario sin id_usuario válido:`, user);
            throw new common_1.ForbiddenException('Error al verificar la identidad del usuario');
        }
        if (userType === 'admin') {
            return;
        }
        if (userType === 'organizacion') {
            if (dto.tipo_rol === 'organizacion') {
                const org = await this.orgRepo.findOne({ where: { id_organizacion: dto.id_organizacion, id_usuario: userId } });
                if (!org) {
                    throw new common_1.ForbiddenException('No tienes permiso para crear roles para esta organización');
                }
            }
            if (dto.tipo_rol === 'proyecto') {
                if (!dto.id_proyecto) {
                    throw new common_1.ForbiddenException('El proyecto es requerido para roles de proyecto');
                }
                const proyecto = await this.proyectoRepo.findOne({
                    where: { id_proyecto: dto.id_proyecto },
                    relations: ['organizacion']
                });
                if (!proyecto) {
                    throw new common_1.ForbiddenException('El proyecto especificado no existe');
                }
                let organizacion = proyecto.organizacion;
                if (!organizacion && proyecto.id_organizacion) {
                    organizacion = await this.orgRepo.findOne({
                        where: { id_organizacion: proyecto.id_organizacion }
                    });
                }
                if (!organizacion) {
                    console.error(`[RolService] No se encontró la organización para el proyecto ${dto.id_proyecto}. id_organizacion del proyecto: ${proyecto.id_organizacion}`);
                    throw new common_1.ForbiddenException('No se pudo verificar la organización del proyecto');
                }
                const organizacionUserId = Number(organizacion.id_usuario);
                const authenticatedUserId = Number(userId);
                if (organizacionUserId !== authenticatedUserId) {
                    console.error(`[RolService] Permiso denegado. Usuario autenticado: ${authenticatedUserId}, Usuario de la organización: ${organizacionUserId}, Proyecto: ${dto.id_proyecto}`);
                    throw new common_1.ForbiddenException('No tienes permiso para crear roles para este proyecto');
                }
            }
        }
        else {
            throw new common_1.ForbiddenException('Solo administradores y organizaciones pueden crear roles');
        }
    }
    async validateUpdatePermissions(rol, user) {
        if (user.tipo_usuario === 'admin') {
            return;
        }
        if (user.tipo_usuario === 'organizacion') {
            if (rol.tipo_rol === 'organizacion' && rol.id_organizacion) {
                const org = await this.orgRepo.findOne({ where: { id_organizacion: rol.id_organizacion, id_usuario: user.id_usuario } });
                if (!org) {
                    throw new common_1.ForbiddenException('No tienes permiso para modificar este rol');
                }
            }
            else if (rol.tipo_rol === 'proyecto' && rol.id_proyecto) {
                const proyecto = await this.proyectoRepo.findOne({
                    where: { id_proyecto: rol.id_proyecto },
                    relations: ['organizacion']
                });
                if (!proyecto || proyecto.organizacion.id_usuario !== user.id_usuario) {
                    throw new common_1.ForbiddenException('No tienes permiso para modificar este rol');
                }
            }
        }
        else {
            throw new common_1.ForbiddenException('No tienes permiso para modificar roles');
        }
    }
    async validateDeletePermissions(rol, user) {
        if (user.tipo_usuario === 'admin') {
            return;
        }
        if (user.tipo_usuario === 'organizacion') {
            if (rol.tipo_rol === 'organizacion' && rol.id_organizacion) {
                const org = await this.orgRepo.findOne({ where: { id_organizacion: rol.id_organizacion, id_usuario: user.id_usuario } });
                if (!org) {
                    throw new common_1.ForbiddenException('No tienes permiso para eliminar este rol');
                }
            }
            else if (rol.tipo_rol === 'proyecto' && rol.id_proyecto) {
                const proyecto = await this.proyectoRepo.findOne({
                    where: { id_proyecto: rol.id_proyecto },
                    relations: ['organizacion']
                });
                if (!proyecto || proyecto.organizacion.id_usuario !== user.id_usuario) {
                    throw new common_1.ForbiddenException('No tienes permiso para eliminar este rol');
                }
            }
        }
        else {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar roles');
        }
    }
    async findExistingRol(dto) {
        const where = {
            nombre: dto.nombre.trim(),
            tipo_rol: dto.tipo_rol
        };
        if (dto.tipo_rol === 'organizacion') {
            where.id_organizacion = dto.id_organizacion;
        }
        else if (dto.tipo_rol === 'proyecto') {
            where.id_proyecto = dto.id_proyecto;
        }
        return this.repo.findOne({ where });
    }
    async getPermisos(id) {
        const rol = await this.findOne(id);
        return this.repo.findOne({
            where: { id_rol: id },
            relations: ['permisos']
        }).then(r => (r === null || r === void 0 ? void 0 : r.permisos) || []);
    }
    async updatePermisos(id, permisosIds, user) {
        const rol = await this.findOne(id);
        if (rol.tipo_rol !== 'organizacion') {
            throw new common_1.BadRequestException('Solo los roles de organización pueden tener permisos');
        }
        await this.validateUpdatePermissions(rol, user);
        const permisos = await this.permisoRepo.find({
            where: { id_permiso: (0, typeorm_2.In)(permisosIds) }
        });
        if (permisos.length !== permisosIds.length) {
            throw new common_1.BadRequestException('Algunos permisos no existen');
        }
        rol.permisos = permisos;
        return this.repo.save(rol);
    }
};
exports.RolService = RolService;
exports.RolService = RolService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(1, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(3, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(4, (0, typeorm_1.InjectRepository)(permiso_entity_1.Permiso)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RolService);
//# sourceMappingURL=rol.service.js.map