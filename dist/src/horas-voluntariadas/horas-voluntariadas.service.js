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
exports.HorasVoluntariadasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const horas_voluntariadas_entity_1 = require("./horas-voluntariadas.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
let HorasVoluntariadasService = class HorasVoluntariadasService {
    constructor(repo, voluntarioRepo, proyectoRepo, tareaRepo, asignacionRepo, orgRepo) {
        this.repo = repo;
        this.voluntarioRepo = voluntarioRepo;
        this.proyectoRepo = proyectoRepo;
        this.tareaRepo = tareaRepo;
        this.asignacionRepo = asignacionRepo;
        this.orgRepo = orgRepo;
    }
    async create(dto, user) {
        if (user.tipo_usuario !== 'voluntario') {
            throw new common_1.ForbiddenException('Solo los voluntarios pueden registrar horas');
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: dto.id_proyecto } });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${dto.id_proyecto} no encontrado`);
        }
        const asignacion = await this.asignacionRepo.findOne({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['tarea', 'tarea.fase']
        });
        if (!asignacion) {
            const asignaciones = await this.asignacionRepo.find({
                where: { id_voluntario: voluntario.id_voluntario },
                relations: ['tarea', 'tarea.fase']
            });
            const tieneAsignacionEnProyecto = asignaciones.some(a => { var _a, _b; return ((_b = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) === dto.id_proyecto; });
            if (!tieneAsignacionEnProyecto) {
                throw new common_1.ForbiddenException('No estás asignado a este proyecto');
            }
        }
        else {
            if (dto.id_tarea) {
                const tarea = await this.tareaRepo.findOne({
                    where: { id_tarea: dto.id_tarea },
                    relations: ['fase']
                });
                if (!tarea) {
                    throw new common_1.NotFoundException(`Tarea con ID ${dto.id_tarea} no encontrada`);
                }
                if (tarea.fase.id_proyecto !== dto.id_proyecto) {
                    throw new common_1.BadRequestException('La tarea no pertenece al proyecto especificado');
                }
                const asignacionTarea = await this.asignacionRepo.findOne({
                    where: {
                        id_voluntario: voluntario.id_voluntario,
                        id_tarea: dto.id_tarea
                    }
                });
                if (!asignacionTarea) {
                    throw new common_1.ForbiddenException('No estás asignado a esta tarea');
                }
            }
        }
        const fechaRegistro = new Date(dto.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaRegistro.setHours(0, 0, 0, 0);
        if (fechaRegistro > hoy) {
            throw new common_1.BadRequestException('No se pueden registrar horas para fechas futuras');
        }
        if (dto.horas_trabajadas <= 0) {
            throw new common_1.BadRequestException('Las horas trabajadas deben ser mayores a 0');
        }
        if (dto.horas_trabajadas > 24) {
            throw new common_1.BadRequestException('No se pueden registrar más de 24 horas en un día');
        }
        if (dto.horas_trabajadas > 16) {
            throw new common_1.BadRequestException('Se recomienda un máximo de 16 horas por día por razones de seguridad. Si necesitas registrar más, contacta a la organización.');
        }
        if (dto.horas_trabajadas > 12 && dto.horas_trabajadas <= 16) {
        }
        const horasDelDia = await this.repo.find({
            where: {
                id_voluntario: voluntario.id_voluntario,
                fecha: fechaRegistro
            }
        });
        const totalHorasDelDia = horasDelDia.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const nuevoTotal = totalHorasDelDia + dto.horas_trabajadas;
        if (nuevoTotal > 24) {
            throw new common_1.BadRequestException(`Ya has registrado ${totalHorasDelDia.toFixed(2)} horas para esta fecha. El total (${nuevoTotal.toFixed(2)} horas) no puede exceder 24 horas por día.`);
        }
        if (nuevoTotal > 16) {
        }
        const horas = this.repo.create({
            id_voluntario: voluntario.id_voluntario,
            id_proyecto: dto.id_proyecto,
            id_tarea: dto.id_tarea || null,
            fecha: fechaRegistro,
            horas_trabajadas: dto.horas_trabajadas,
            descripcion: dto.descripcion || null,
            verificada: false
        });
        return this.repo.save(horas);
    }
    async findAllByVolunteer(user) {
        if (user.tipo_usuario !== 'voluntario') {
            throw new common_1.ForbiddenException('Solo los voluntarios pueden ver sus horas');
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        return this.repo.find({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['proyecto', 'tarea', 'tarea.fase'],
            order: { fecha: 'DESC', creado_en: 'DESC' }
        });
    }
    async findByProject(idProyecto, user) {
        if (user.tipo_usuario !== 'voluntario') {
            throw new common_1.ForbiddenException('Solo los voluntarios pueden ver sus horas');
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        const asignaciones = await this.asignacionRepo.find({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['tarea', 'tarea.fase']
        });
        const tieneAsignacionEnProyecto = asignaciones.some(a => { var _a, _b; return ((_b = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) === idProyecto; });
        if (!tieneAsignacionEnProyecto) {
            throw new common_1.ForbiddenException('No estás asignado a este proyecto');
        }
        return this.repo.find({
            where: {
                id_voluntario: voluntario.id_voluntario,
                id_proyecto: idProyecto
            },
            relations: ['proyecto', 'tarea', 'tarea.fase'],
            order: { fecha: 'DESC', creado_en: 'DESC' }
        });
    }
    async getResumenByProject(idProyecto, user) {
        if (user.tipo_usuario !== 'voluntario') {
            throw new common_1.ForbiddenException('Solo los voluntarios pueden ver sus horas');
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        const horas = await this.repo.find({
            where: {
                id_voluntario: voluntario.id_voluntario,
                id_proyecto: idProyecto
            }
        });
        const totalHoras = horas.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const horasVerificadas = horas.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const horasPendientes = horas.filter(h => !h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        return {
            totalHoras: parseFloat(totalHoras.toFixed(2)),
            horasVerificadas: parseFloat(horasVerificadas.toFixed(2)),
            horasPendientes: parseFloat(horasPendientes.toFixed(2)),
            totalRegistros: horas.length,
            registrosVerificados: horas.filter(h => h.verificada).length,
            registrosPendientes: horas.filter(h => !h.verificada).length
        };
    }
    async findAllByProjectForOrganization(idProyecto, user) {
        if (user.tipo_usuario !== 'organizacion' && user.tipo_usuario !== 'admin') {
            throw new common_1.ForbiddenException('Solo las organizaciones pueden ver todas las horas del proyecto');
        }
        const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: idProyecto } });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${idProyecto} no encontrado`);
        }
        if (user.tipo_usuario !== 'admin') {
            const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
            if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
                throw new common_1.ForbiddenException('No tienes permiso para ver las horas de este proyecto');
            }
        }
        return this.repo.find({
            where: { id_proyecto: idProyecto },
            relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase'],
            order: { fecha: 'DESC', creado_en: 'DESC' }
        });
    }
    async update(id, dto, user) {
        const horas = await this.repo.findOne({
            where: { id_horas: id },
            relations: ['voluntario']
        });
        if (!horas) {
            throw new common_1.NotFoundException(`Horas con ID ${id} no encontradas`);
        }
        if (user.tipo_usuario === 'voluntario') {
            const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
            if (!voluntario || horas.id_voluntario !== voluntario.id_voluntario) {
                throw new common_1.ForbiddenException('Solo puedes actualizar tus propias horas');
            }
            if (dto.verificada !== undefined) {
                throw new common_1.ForbiddenException('No puedes cambiar el estado de verificación');
            }
        }
        if (user.tipo_usuario === 'organizacion' || user.tipo_usuario === 'admin') {
            if (dto.verificada === undefined) {
                throw new common_1.BadRequestException('Las organizaciones solo pueden verificar horas');
            }
            const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: horas.id_proyecto } });
            if (user.tipo_usuario !== 'admin') {
                const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
                if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
                    throw new common_1.ForbiddenException('No tienes permiso para verificar horas de este proyecto');
                }
            }
            horas.verificada = dto.verificada;
            return this.repo.save(horas);
        }
        if (dto.fecha)
            horas.fecha = new Date(dto.fecha);
        if (dto.horas_trabajadas !== undefined)
            horas.horas_trabajadas = dto.horas_trabajadas;
        if (dto.descripcion !== undefined)
            horas.descripcion = dto.descripcion;
        if (dto.id_tarea !== undefined)
            horas.id_tarea = dto.id_tarea;
        return this.repo.save(horas);
    }
    async remove(id, user) {
        const horas = await this.repo.findOne({
            where: { id_horas: id },
            relations: ['voluntario']
        });
        if (!horas) {
            throw new common_1.NotFoundException(`Horas con ID ${id} no encontradas`);
        }
        if (user.tipo_usuario !== 'voluntario') {
            throw new common_1.ForbiddenException('Solo los voluntarios pueden eliminar sus horas');
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!voluntario || horas.id_voluntario !== voluntario.id_voluntario) {
            throw new common_1.ForbiddenException('Solo puedes eliminar tus propias horas');
        }
        return this.repo.remove(horas);
    }
    async verificar(id, verificada, user) {
        const horas = await this.repo.findOne({
            where: { id_horas: id },
            relations: ['proyecto']
        });
        if (!horas) {
            throw new common_1.NotFoundException(`Horas con ID ${id} no encontradas`);
        }
        if (user.tipo_usuario !== 'organizacion' && user.tipo_usuario !== 'admin') {
            throw new common_1.ForbiddenException('Solo las organizaciones pueden verificar horas');
        }
        const proyecto = await this.proyectoRepo.findOne({ where: { id_proyecto: horas.id_proyecto } });
        if (user.tipo_usuario !== 'admin') {
            const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
            if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
                throw new common_1.ForbiddenException('No tienes permiso para verificar horas de este proyecto');
            }
        }
        horas.verificada = verificada;
        return this.repo.save(horas);
    }
};
exports.HorasVoluntariadasService = HorasVoluntariadasService;
exports.HorasVoluntariadasService = HorasVoluntariadasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(horas_voluntariadas_entity_1.HorasVoluntariadas)),
    __param(1, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(2, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(3, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(4, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(5, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HorasVoluntariadasService);
//# sourceMappingURL=horas-voluntariadas.service.js.map