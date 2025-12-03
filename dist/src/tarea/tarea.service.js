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
exports.TareaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tarea_entity_1 = require("./tarea.entity");
const fase_entity_1 = require("../fase/fase.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
let TareaService = class TareaService {
    constructor(repo, faseRepo, proyectoRepo, orgRepo, voluntarioRepo, asignacionRepo, horasRepo) {
        this.repo = repo;
        this.faseRepo = faseRepo;
        this.proyectoRepo = proyectoRepo;
        this.orgRepo = orgRepo;
        this.voluntarioRepo = voluntarioRepo;
        this.asignacionRepo = asignacionRepo;
        this.horasRepo = horasRepo;
    }
    async create(dto, user) {
        const fase = await this.faseRepo.findOne({
            where: { id_fase: dto.id_fase },
            relations: ['proyecto']
        });
        if (!fase) {
            throw new common_1.NotFoundException(`Fase con ID ${dto.id_fase} no encontrada`);
        }
        await this.checkOrganizacionOwnership(fase.id_proyecto, user);
        if (!dto.fecha_inicio || !dto.fecha_fin) {
            throw new common_1.BadRequestException('Las fechas de inicio y fin son requeridas para la tarea');
        }
        const fechaInicio = new Date(dto.fecha_inicio);
        const fechaFin = new Date(dto.fecha_fin);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);
        if (fechaInicio > fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
        }
        if (fase.fecha_inicio && fase.fecha_fin) {
            const faseInicio = new Date(fase.fecha_inicio);
            const faseFin = new Date(fase.fecha_fin);
            faseInicio.setHours(0, 0, 0, 0);
            faseFin.setHours(0, 0, 0, 0);
            if (fechaInicio < faseInicio) {
                throw new common_1.BadRequestException(`La fecha de inicio de la tarea (${dto.fecha_inicio}) no puede ser anterior al inicio de la fase (${fase.fecha_inicio})`);
            }
            if (fechaFin > faseFin) {
                throw new common_1.BadRequestException(`La fecha de fin de la tarea (${dto.fecha_fin}) no puede ser posterior al fin de la fase (${fase.fecha_fin})`);
            }
        }
        if (fase.proyecto) {
            const proyectoInicio = new Date(fase.proyecto.fecha_inicio);
            const proyectoFin = new Date(fase.proyecto.fecha_fin);
            proyectoInicio.setHours(0, 0, 0, 0);
            proyectoFin.setHours(0, 0, 0, 0);
            if (fechaInicio < proyectoInicio) {
                throw new common_1.BadRequestException(`La fecha de inicio de la tarea (${dto.fecha_inicio}) no puede ser anterior al inicio del proyecto (${fase.proyecto.fecha_inicio})`);
            }
            if (fechaFin > proyectoFin) {
                throw new common_1.BadRequestException(`La fecha de fin de la tarea (${dto.fecha_fin}) no puede ser posterior al fin del proyecto (${fase.proyecto.fecha_fin})`);
            }
        }
        const tarea = this.repo.create(dto);
        return this.repo.save(tarea);
    }
    findAllByProyecto(idProyecto) {
        return this.repo.createQueryBuilder('tarea')
            .innerJoin('tarea.fase', 'fase')
            .where('fase.id_proyecto = :idProyecto', { idProyecto })
            .getMany();
    }
    async findOne(id) {
        return this.repo.findOne({
            where: { id_tarea: id },
            relations: ['fase', 'fase.proyecto']
        });
    }
    async update(id, dto, user) {
        const tarea = await this.repo.findOne({
            where: { id_tarea: id },
            relations: ['fase', 'fase.proyecto']
        });
        if (!tarea) {
            throw new common_1.NotFoundException(`Tarea con ID ${id} no encontrada`);
        }
        if (user.tipo_usuario === 'organizacion') {
            await this.checkOrganizacionOwnership(tarea.fase.id_proyecto, user);
        }
        else if (user.tipo_usuario === 'voluntario') {
            const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario: user.id_usuario } });
            if (!voluntario) {
                throw new common_1.NotFoundException('Voluntario no encontrado');
            }
            const asignacion = await this.asignacionRepo.findOne({ where: { id_tarea: id, id_voluntario: voluntario.id_voluntario } });
            if (!asignacion) {
                throw new common_1.ForbiddenException('No tienes permiso para actualizar esta tarea.');
            }
            if (dto.id_estado) {
                const { id_estado } = dto;
                return this.repo.update(id, { id_estado });
            }
            throw new common_1.ForbiddenException('Como voluntario, solo puedes actualizar el estado de la tarea.');
        }
        else if (user.tipo_usuario !== 'admin') {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar esta tarea.');
        }
        if (dto.fecha_inicio || dto.fecha_fin) {
            const fechaInicio = dto.fecha_inicio
                ? new Date(dto.fecha_inicio)
                : (tarea.fecha_inicio ? new Date(tarea.fecha_inicio) : null);
            const fechaFin = dto.fecha_fin
                ? new Date(dto.fecha_fin)
                : (tarea.fecha_fin ? new Date(tarea.fecha_fin) : null);
            if (!fechaInicio || !fechaFin) {
                throw new common_1.BadRequestException('Ambas fechas (inicio y fin) son requeridas');
            }
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin.setHours(0, 0, 0, 0);
            if (fechaInicio > fechaFin) {
                throw new common_1.BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
            }
            if (tarea.fase.fecha_inicio && tarea.fase.fecha_fin) {
                const faseInicio = new Date(tarea.fase.fecha_inicio);
                const faseFin = new Date(tarea.fase.fecha_fin);
                faseInicio.setHours(0, 0, 0, 0);
                faseFin.setHours(0, 0, 0, 0);
                if (fechaInicio < faseInicio) {
                    throw new common_1.BadRequestException(`La fecha de inicio de la tarea no puede ser anterior al inicio de la fase (${tarea.fase.fecha_inicio})`);
                }
                if (fechaFin > faseFin) {
                    throw new common_1.BadRequestException(`La fecha de fin de la tarea no puede ser posterior al fin de la fase (${tarea.fase.fecha_fin})`);
                }
            }
            if (tarea.fase.proyecto) {
                const proyectoInicio = new Date(tarea.fase.proyecto.fecha_inicio);
                const proyectoFin = new Date(tarea.fase.proyecto.fecha_fin);
                proyectoInicio.setHours(0, 0, 0, 0);
                proyectoFin.setHours(0, 0, 0, 0);
                if (fechaInicio < proyectoInicio) {
                    throw new common_1.BadRequestException(`La fecha de inicio de la tarea no puede ser anterior al inicio del proyecto (${tarea.fase.proyecto.fecha_inicio})`);
                }
                if (fechaFin > proyectoFin) {
                    throw new common_1.BadRequestException(`La fecha de fin de la tarea no puede ser posterior al fin del proyecto (${tarea.fase.proyecto.fecha_fin})`);
                }
            }
        }
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id, user) {
        const tarea = await this.findOne(id);
        if (!tarea) {
            throw new common_1.NotFoundException(`Tarea con ID ${id} no encontrada`);
        }
        await this.checkOrganizacionOwnership(tarea.fase.id_proyecto, user);
        const asignaciones = await this.asignacionRepo.find({
            where: { id_tarea: id }
        });
        if (asignaciones.length > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la tarea porque tiene ${asignaciones.length} asignación(es) activa(s). Por favor, elimina primero todas las asignaciones.`);
        }
        const horasVoluntariadas = await this.horasRepo.find({
            where: { id_tarea: id }
        });
        if (horasVoluntariadas.length > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar la tarea porque tiene ${horasVoluntariadas.length} registro(s) de horas voluntariadas. Por favor, elimina primero todos los registros de horas.`);
        }
        return this.repo.remove(tarea);
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
exports.TareaService = TareaService;
exports.TareaService = TareaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(1, (0, typeorm_1.InjectRepository)(fase_entity_1.Fase)),
    __param(2, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(3, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(4, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(5, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(6, (0, typeorm_1.InjectRepository)(horas_voluntariadas_entity_1.HorasVoluntariadas)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TareaService);
//# sourceMappingURL=tarea.service.js.map