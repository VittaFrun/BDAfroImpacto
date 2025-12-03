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
exports.OrganizacionMiembroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const organizacion_miembro_entity_1 = require("./organizacion-miembro.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
let OrganizacionMiembroService = class OrganizacionMiembroService {
    constructor(repo, orgRepo, voluntarioRepo, rolRepo) {
        this.repo = repo;
        this.orgRepo = orgRepo;
        this.voluntarioRepo = voluntarioRepo;
        this.rolRepo = rolRepo;
    }
    async create(dto, user) {
        const organizacion = await this.orgRepo.findOne({
            where: { id_organizacion: dto.id_organizacion }
        });
        if (!organizacion) {
            throw new common_1.NotFoundException(`Organización con ID ${dto.id_organizacion} no encontrada`);
        }
        const voluntario = await this.voluntarioRepo.findOne({
            where: { id_voluntario: dto.id_voluntario }
        });
        if (!voluntario) {
            throw new common_1.NotFoundException(`Voluntario con ID ${dto.id_voluntario} no encontrado`);
        }
        const existing = await this.repo.findOne({
            where: {
                id_organizacion: dto.id_organizacion,
                id_voluntario: dto.id_voluntario
            }
        });
        if (existing) {
            throw new common_1.ConflictException('El voluntario ya es miembro de esta organización');
        }
        if (dto.id_rol_organizacion) {
            const rol = await this.rolRepo.findOne({
                where: { id_rol: dto.id_rol_organizacion }
            });
            if (!rol) {
                throw new common_1.NotFoundException(`Rol con ID ${dto.id_rol_organizacion} no encontrado`);
            }
            if (rol.tipo_rol !== 'organizacion' || rol.id_organizacion !== dto.id_organizacion) {
                throw new common_1.BadRequestException('El rol debe ser un rol de organización válido para esta organización');
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
    async findAllByOrganization(id_organizacion, user) {
        const organizacion = await this.orgRepo.findOne({
            where: { id_organizacion }
        });
        if (!organizacion) {
            throw new common_1.NotFoundException(`Organización con ID ${id_organizacion} no encontrada`);
        }
        if (user && user.tipo_usuario === 'organizacion') {
            if (organizacion.id_usuario !== user.id_usuario) {
                throw new common_1.ForbiddenException('No tienes permiso para ver los miembros de esta organización');
            }
        }
        return this.repo.find({
            where: { id_organizacion },
            relations: ['voluntario', 'voluntario.usuario', 'rol_organizacion'],
            order: { creado_en: 'DESC' }
        });
    }
    async findOne(id, user) {
        const miembro = await this.repo.findOne({
            where: { id_miembro: id },
            relations: ['organizacion', 'voluntario', 'voluntario.usuario', 'rol_organizacion']
        });
        if (!miembro) {
            throw new common_1.NotFoundException(`Miembro con ID ${id} no encontrado`);
        }
        if (user && user.tipo_usuario === 'organizacion') {
            const organizacion = await this.orgRepo.findOne({
                where: { id_organizacion: miembro.id_organizacion }
            });
            if (organizacion && organizacion.id_usuario !== user.id_usuario) {
                throw new common_1.ForbiddenException('No tienes permiso para ver este miembro');
            }
        }
        return miembro;
    }
    async update(id, dto, user) {
        const miembro = await this.findOne(id, user);
        const organizacion = await this.orgRepo.findOne({
            where: { id_organizacion: miembro.id_organizacion }
        });
        if (user.tipo_usuario === 'organizacion' && organizacion.id_usuario !== user.id_usuario) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar este miembro');
        }
        if (dto.id_rol_organizacion !== undefined) {
            if (dto.id_rol_organizacion !== null) {
                const rol = await this.rolRepo.findOne({
                    where: { id_rol: dto.id_rol_organizacion }
                });
                if (!rol) {
                    throw new common_1.NotFoundException(`Rol con ID ${dto.id_rol_organizacion} no encontrado`);
                }
                if (rol.tipo_rol !== 'organizacion' || rol.id_organizacion !== miembro.id_organizacion) {
                    throw new common_1.BadRequestException('El rol debe ser un rol de organización válido para esta organización');
                }
            }
            miembro.id_rol_organizacion = dto.id_rol_organizacion;
        }
        if (dto.estado !== undefined) {
            miembro.estado = dto.estado;
            if (dto.estado === 'activo' && miembro.fecha_aprobacion === null) {
                miembro.fecha_aprobacion = new Date();
            }
        }
        if (dto.fecha_aprobacion !== undefined) {
            miembro.fecha_aprobacion = dto.fecha_aprobacion ? new Date(dto.fecha_aprobacion) : null;
        }
        return this.repo.save(miembro);
    }
    async remove(id, user) {
        const miembro = await this.findOne(id, user);
        const organizacion = await this.orgRepo.findOne({
            where: { id_organizacion: miembro.id_organizacion }
        });
        if (user.tipo_usuario === 'organizacion' && organizacion.id_usuario !== user.id_usuario) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este miembro');
        }
        await this.repo.remove(miembro);
        return { message: 'Miembro eliminado correctamente' };
    }
    async solicitarUnirse(id_organizacion, id_usuario) {
        const voluntario = await this.voluntarioRepo.findOne({
            where: { id_usuario }
        });
        if (!voluntario) {
            throw new common_1.NotFoundException('No se encontró un perfil de voluntario para este usuario');
        }
        const id_voluntario = voluntario.id_voluntario;
        const existing = await this.repo.findOne({
            where: {
                id_organizacion,
                id_voluntario
            }
        });
        if (existing) {
            if (existing.estado === 'pendiente') {
                throw new common_1.ConflictException('Ya existe una solicitud pendiente para esta organización');
            }
            if (existing.estado === 'activo') {
                throw new common_1.ConflictException('Ya eres miembro activo de esta organización');
            }
        }
        const dto = {
            id_organizacion,
            id_voluntario,
            estado: 'pendiente',
            fecha_solicitud: new Date()
        };
        return this.create(dto, null);
    }
    async aprobarSolicitud(id_miembro, id_rol_organizacion, user) {
        const miembro = await this.findOne(id_miembro, user);
        if (miembro.estado !== 'pendiente') {
            throw new common_1.BadRequestException('Solo se pueden aprobar solicitudes pendientes');
        }
        const updateDto = {
            estado: 'activo',
            id_rol_organizacion: id_rol_organizacion || null,
            fecha_aprobacion: new Date()
        };
        return this.update(id_miembro, updateDto, user);
    }
};
exports.OrganizacionMiembroService = OrganizacionMiembroService;
exports.OrganizacionMiembroService = OrganizacionMiembroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organizacion_miembro_entity_1.OrganizacionMiembro)),
    __param(1, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(3, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrganizacionMiembroService);
//# sourceMappingURL=organizacion-miembro.service.js.map