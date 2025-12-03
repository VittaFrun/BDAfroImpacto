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
exports.AsignacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asignacion_entity_1 = require("./asignacion.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
const eliminacion_historial_service_1 = require("../eliminacion-historial/eliminacion-historial.service");
const notificacion_service_1 = require("../notificacion/notificacion.service");
let AsignacionService = class AsignacionService {
    constructor(repo, tareaRepo, proyectoRepo, orgRepo, voluntarioRepo, rolRepo, eliminacionHistorialService, notificacionService) {
        this.repo = repo;
        this.tareaRepo = tareaRepo;
        this.proyectoRepo = proyectoRepo;
        this.orgRepo = orgRepo;
        this.voluntarioRepo = voluntarioRepo;
        this.rolRepo = rolRepo;
        this.eliminacionHistorialService = eliminacionHistorialService;
        this.notificacionService = notificacionService;
    }
    async create(dto, user) {
        var _a;
        const tarea = await this.tareaRepo.findOne({
            where: { id_tarea: dto.id_tarea },
            relations: ['fase', 'fase.proyecto']
        });
        if (!tarea) {
            throw new common_1.NotFoundException(`Tarea con ID ${dto.id_tarea} no encontrada`);
        }
        const proyecto = await this.proyectoRepo.findOne({
            where: { id_proyecto: tarea.fase.id_proyecto },
            relations: ['organizacion']
        });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto no encontrado`);
        }
        await this.checkOrganizacionOwnership(proyecto.id_proyecto, user);
        await this.validateRolForProject(dto.id_rol, proyecto.id_proyecto);
        const asignacion = this.repo.create({
            id_tarea: dto.id_tarea,
            id_voluntario: dto.id_voluntario,
            id_rol: dto.id_rol
        });
        const saved = await this.repo.save(asignacion);
        const asignacionCompleta = await this.repo.findOne({
            where: { id_asignacion: saved.id_asignacion },
            relations: ['rol', 'voluntario', 'voluntario.usuario', 'tarea']
        });
        if (((_a = asignacionCompleta === null || asignacionCompleta === void 0 ? void 0 : asignacionCompleta.voluntario) === null || _a === void 0 ? void 0 : _a.usuario) && (asignacionCompleta === null || asignacionCompleta === void 0 ? void 0 : asignacionCompleta.tarea) && (asignacionCompleta === null || asignacionCompleta === void 0 ? void 0 : asignacionCompleta.rol)) {
            try {
                await this.notificacionService.notificarNuevaAsignacion(asignacionCompleta.voluntario.id_voluntario, proyecto.id_proyecto, asignacionCompleta.tarea.id_tarea, asignacionCompleta.tarea.descripcion || 'Tarea sin nombre', proyecto.nombre || 'Proyecto sin nombre', asignacionCompleta.rol.nombre || asignacionCompleta.rol.nombre || 'Rol sin nombre');
            }
            catch (error) {
                console.error('Error al notificar nueva asignación:', error);
            }
        }
        return asignacionCompleta;
    }
    async validateRolForProject(id_rol, id_proyecto) {
        const rol = await this.rolRepo.findOne({ where: { id_rol } });
        if (!rol) {
            throw new common_1.NotFoundException(`Rol con ID ${id_rol} no encontrado`);
        }
        if (!rol.activo) {
            throw new common_1.BadRequestException('El rol no está activo');
        }
        const proyecto = await this.proyectoRepo.findOne({
            where: { id_proyecto },
            relations: ['organizacion']
        });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
        }
        const isValid = (rol.tipo_rol === 'organizacion' && rol.id_organizacion === proyecto.id_organizacion) ||
            (rol.tipo_rol === 'proyecto' && rol.id_proyecto === id_proyecto);
        if (!isValid) {
            throw new common_1.BadRequestException('El rol seleccionado no está disponible para este proyecto');
        }
        return true;
    }
    findAllByTarea(idTarea) {
        return this.repo.find({
            where: { id_tarea: idTarea },
            relations: ['rol', 'voluntario', 'tarea']
        });
    }
    async findTasksByVoluntario(id_usuario) {
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        return this.repo.find({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['tarea', 'rol']
        });
    }
    async findAsignacionesByProyecto(id_proyecto, id_usuario) {
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        const asignaciones = await this.repo.find({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['tarea', 'tarea.fase', 'tarea.estado', 'rol']
        });
        const asignacionesProyecto = asignaciones.filter(a => { var _a, _b; return ((_b = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) === id_proyecto; });
        return asignacionesProyecto;
    }
    async remove(id, user) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const asignacion = await this.repo.findOne({
            where: { id_asignacion: id },
            relations: ['tarea', 'tarea.fase', 'rol', 'voluntario']
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`Asignacion con ID ${id} no encontrada`);
        }
        await this.checkOrganizacionOwnership(asignacion.tarea.fase.id_proyecto, user);
        try {
            await this.eliminacionHistorialService.registrarEliminacion({
                tipo_entidad: 'asignacion',
                id_entidad: id,
                nombre_entidad: `Asignación de ${((_b = (_a = asignacion.voluntario) === null || _a === void 0 ? void 0 : _a.usuario) === null || _b === void 0 ? void 0 : _b.nombre) || 'voluntario'} a ${((_c = asignacion.tarea) === null || _c === void 0 ? void 0 : _c.descripcion) || 'tarea'}`,
                descripcion: `Asignación eliminada: ${((_d = asignacion.rol) === null || _d === void 0 ? void 0 : _d.nombre) || 'Rol'} en tarea "${((_e = asignacion.tarea) === null || _e === void 0 ? void 0 : _e.descripcion) || 'Tarea desconocida'}"`,
                id_proyecto: asignacion.tarea.fase.id_proyecto,
                datos_adicionales: {
                    id_voluntario: asignacion.id_voluntario,
                    id_tarea: asignacion.id_tarea,
                    id_rol: asignacion.id_rol,
                    voluntario_nombre: (_g = (_f = asignacion.voluntario) === null || _f === void 0 ? void 0 : _f.usuario) === null || _g === void 0 ? void 0 : _g.nombre,
                    tarea_nombre: (_h = asignacion.tarea) === null || _h === void 0 ? void 0 : _h.descripcion,
                    rol_nombre: (_j = asignacion.rol) === null || _j === void 0 ? void 0 : _j.nombre,
                },
            }, user);
        }
        catch (error) {
            console.error('Error al registrar eliminación en historial:', error);
        }
        try {
            if ((_k = asignacion.voluntario) === null || _k === void 0 ? void 0 : _k.id_usuario) {
                await this.notificacionService.crear({
                    id_usuario: asignacion.voluntario.id_usuario,
                    titulo: 'Asignación Eliminada',
                    mensaje: `Tu asignación como "${((_l = asignacion.rol) === null || _l === void 0 ? void 0 : _l.nombre) || 'Rol'}" en la tarea "${((_m = asignacion.tarea) === null || _m === void 0 ? void 0 : _m.descripcion) || 'Tarea'}" ha sido eliminada del proyecto.`,
                    tipo: 'warning',
                    id_proyecto: asignacion.tarea.fase.id_proyecto,
                    tipo_entidad: 'asignacion',
                    id_entidad: id,
                    datos_adicionales: {
                        id_voluntario: asignacion.id_voluntario,
                        id_tarea: asignacion.id_tarea,
                        id_rol: asignacion.id_rol,
                        tarea_nombre: (_o = asignacion.tarea) === null || _o === void 0 ? void 0 : _o.descripcion,
                        rol_nombre: (_p = asignacion.rol) === null || _p === void 0 ? void 0 : _p.nombre,
                    },
                });
            }
        }
        catch (error) {
            console.error('Error al crear notificación:', error);
        }
        return this.repo.remove(asignacion);
    }
    async getVolunteerAssignments(id_voluntario, id_proyecto) {
        const query = this.repo
            .createQueryBuilder('asignacion')
            .innerJoinAndSelect('asignacion.tarea', 'tarea')
            .innerJoinAndSelect('tarea.fase', 'fase')
            .innerJoinAndSelect('tarea.estado', 'estado')
            .innerJoinAndSelect('asignacion.rol', 'rol')
            .where('asignacion.id_voluntario = :id_voluntario', { id_voluntario });
        if (id_proyecto) {
            query.andWhere('fase.id_proyecto = :id_proyecto', { id_proyecto });
        }
        return query.getMany();
    }
    async checkVolunteerAssignmentsInProject(id_voluntario, id_proyecto) {
        const asignaciones = await this.getVolunteerAssignments(id_voluntario, id_proyecto);
        return {
            hasAssignments: asignaciones.length > 0,
            count: asignaciones.length,
            assignments: asignaciones.map(a => {
                var _a;
                return ({
                    id_asignacion: a.id_asignacion,
                    tarea: {
                        id_tarea: a.tarea.id_tarea,
                        nombre: a.tarea.descripcion,
                        estado: ((_a = a.tarea.estado) === null || _a === void 0 ? void 0 : _a.nombre) || 'Sin estado'
                    },
                    rol: {
                        id_rol: a.rol.id_rol,
                        nombre: a.rol.nombre
                    }
                });
            })
        };
    }
    async checkOrganizacionOwnership(id_proyecto, user) {
        if (user.tipo_usuario === 'admin')
            return;
        const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto } });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
        }
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso sobre este proyecto.');
        }
    }
};
exports.AsignacionService = AsignacionService;
exports.AsignacionService = AsignacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(1, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(2, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(3, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(4, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(5, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        eliminacion_historial_service_1.EliminacionHistorialService,
        notificacion_service_1.NotificacionService])
], AsignacionService);
//# sourceMappingURL=asignacion.service.js.map