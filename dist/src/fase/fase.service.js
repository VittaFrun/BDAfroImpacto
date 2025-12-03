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
exports.FaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fase_entity_1 = require("./fase.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
let FaseService = class FaseService {
    constructor(repo, proyectoRepo, tareaRepo) {
        this.repo = repo;
        this.proyectoRepo = proyectoRepo;
        this.tareaRepo = tareaRepo;
    }
    async create(dto) {
        const proyecto = await this.proyectoRepo.findOne({
            where: { id_proyecto: dto.id_proyecto }
        });
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${dto.id_proyecto} no encontrado`);
        }
        let ordenFinal = dto.orden;
        if (!ordenFinal) {
            const maxOrden = await this.repo
                .createQueryBuilder('fase')
                .where('fase.id_proyecto = :id_proyecto', { id_proyecto: dto.id_proyecto })
                .select('MAX(fase.orden)', 'max')
                .getRawOne();
            ordenFinal = ((maxOrden === null || maxOrden === void 0 ? void 0 : maxOrden.max) || 0) + 1;
        }
        const existingFase = await this.repo.findOne({
            where: {
                id_proyecto: dto.id_proyecto,
                orden: ordenFinal
            }
        });
        if (existingFase) {
            throw new common_1.ConflictException(`Ya existe una fase con orden ${ordenFinal} en este proyecto. El siguiente orden disponible es ${ordenFinal + 1}`);
        }
        if (dto.fecha_inicio && dto.fecha_fin) {
            const fechaInicio = new Date(dto.fecha_inicio);
            const fechaFin = new Date(dto.fecha_fin);
            const proyectoInicio = new Date(proyecto.fecha_inicio);
            const proyectoFin = new Date(proyecto.fecha_fin);
            fechaInicio.setHours(0, 0, 0, 0);
            fechaFin.setHours(0, 0, 0, 0);
            proyectoInicio.setHours(0, 0, 0, 0);
            proyectoFin.setHours(0, 0, 0, 0);
            if (fechaInicio < proyectoInicio) {
                throw new common_1.BadRequestException(`La fecha de inicio de la fase (${dto.fecha_inicio}) no puede ser anterior al inicio del proyecto (${proyecto.fecha_inicio})`);
            }
            if (fechaFin > proyectoFin) {
                throw new common_1.BadRequestException(`La fecha de fin de la fase (${dto.fecha_fin}) no puede ser posterior al fin del proyecto (${proyecto.fecha_fin})`);
            }
            if (fechaInicio > fechaFin) {
                throw new common_1.BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
            }
            const fasesExistentes = await this.repo.find({
                where: { id_proyecto: dto.id_proyecto },
                select: ['id_fase', 'nombre', 'fecha_inicio', 'fecha_fin']
            });
            for (const faseExistente of fasesExistentes) {
                if (faseExistente.fecha_inicio && faseExistente.fecha_fin) {
                    const existenteInicio = new Date(faseExistente.fecha_inicio);
                    const existenteFin = new Date(faseExistente.fecha_fin);
                    existenteInicio.setHours(0, 0, 0, 0);
                    existenteFin.setHours(0, 0, 0, 0);
                    if ((fechaInicio <= existenteFin && fechaFin >= existenteInicio)) {
                        throw new common_1.ConflictException(`Las fechas de la fase se solapan con la fase "${faseExistente.nombre}" (${faseExistente.fecha_inicio} - ${faseExistente.fecha_fin})`);
                    }
                }
            }
        }
        const fase = this.repo.create(Object.assign(Object.assign({}, dto), { orden: ordenFinal }));
        return this.repo.save(fase);
    }
    findAll() {
        return this.repo.find({
            relations: ['proyecto', 'tareas'],
            order: { orden: 'ASC' }
        });
    }
    async findOne(id) {
        const fase = await this.repo.findOne({
            where: { id_fase: id },
            relations: ['proyecto', 'tareas']
        });
        if (!fase) {
            throw new common_1.NotFoundException(`Fase con ID ${id} no encontrada`);
        }
        return fase;
    }
    async update(id, dto) {
        const fase = await this.findOne(id);
        if (dto.orden !== undefined && dto.orden !== fase.orden) {
            const existingFase = await this.repo.findOne({
                where: {
                    id_proyecto: fase.id_proyecto,
                    orden: dto.orden
                }
            });
            if (existingFase && existingFase.id_fase !== id) {
                throw new common_1.ConflictException(`Ya existe una fase con orden ${dto.orden} en este proyecto`);
            }
        }
        const fechaInicio = dto.fecha_inicio ? new Date(dto.fecha_inicio) : (fase.fecha_inicio ? new Date(fase.fecha_inicio) : null);
        const fechaFin = dto.fecha_fin ? new Date(dto.fecha_fin) : (fase.fecha_fin ? new Date(fase.fecha_fin) : null);
        if (fechaInicio || fechaFin) {
            const proyecto = await this.proyectoRepo.findOne({
                where: { id_proyecto: fase.id_proyecto }
            });
            if (!proyecto) {
                throw new common_1.NotFoundException('Proyecto asociado no encontrado');
            }
            if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
                throw new common_1.BadRequestException('Debe proporcionar tanto fecha de inicio como fecha de fin, o ninguna');
            }
            if (fechaInicio && fechaFin) {
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin.setHours(0, 0, 0, 0);
                const proyectoInicio = new Date(proyecto.fecha_inicio);
                const proyectoFin = new Date(proyecto.fecha_fin);
                proyectoInicio.setHours(0, 0, 0, 0);
                proyectoFin.setHours(0, 0, 0, 0);
                if (fechaInicio < proyectoInicio) {
                    throw new common_1.BadRequestException(`La fecha de inicio de la fase no puede ser anterior al inicio del proyecto (${proyecto.fecha_inicio})`);
                }
                if (fechaFin > proyectoFin) {
                    throw new common_1.BadRequestException(`La fecha de fin de la fase no puede ser posterior al fin del proyecto (${proyecto.fecha_fin})`);
                }
                if (fechaInicio > fechaFin) {
                    throw new common_1.BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
                }
                const fasesExistentes = await this.repo.find({
                    where: { id_proyecto: fase.id_proyecto },
                    select: ['id_fase', 'nombre', 'fecha_inicio', 'fecha_fin']
                });
                for (const faseExistente of fasesExistentes) {
                    if (faseExistente.id_fase === id)
                        continue;
                    if (faseExistente.fecha_inicio && faseExistente.fecha_fin) {
                        const existenteInicio = new Date(faseExistente.fecha_inicio);
                        const existenteFin = new Date(faseExistente.fecha_fin);
                        existenteInicio.setHours(0, 0, 0, 0);
                        existenteFin.setHours(0, 0, 0, 0);
                        if ((fechaInicio <= existenteFin && fechaFin >= existenteInicio)) {
                            throw new common_1.ConflictException(`Las fechas de la fase se solapan con la fase "${faseExistente.nombre}" (${faseExistente.fecha_inicio} - ${faseExistente.fecha_fin})`);
                        }
                    }
                }
                const tareas = await this.tareaRepo.find({
                    where: { id_fase: id },
                    select: ['id_tarea', 'descripcion', 'fecha_inicio', 'fecha_fin']
                });
                for (const tarea of tareas) {
                    const tareaInicio = new Date(tarea.fecha_inicio);
                    const tareaFin = new Date(tarea.fecha_fin);
                    tareaInicio.setHours(0, 0, 0, 0);
                    tareaFin.setHours(0, 0, 0, 0);
                    if (tareaInicio < fechaInicio || tareaFin > fechaFin) {
                        throw new common_1.BadRequestException(`No se puede actualizar la fase porque la tarea "${tarea.descripcion.substring(0, 50)}..." tiene fechas fuera del nuevo rango de la fase`);
                    }
                }
            }
        }
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        const fase = await this.findOne(id);
        const tareas = await this.tareaRepo.find({
            where: { id_fase: id },
            select: ['id_tarea', 'descripcion']
        });
        if (tareas.length > 0) {
            const tareasList = tareas.slice(0, 5).map(t => `"${t.descripcion.substring(0, 30)}..."`).join(', ');
            const mensaje = tareas.length > 5
                ? `${tareasList} y ${tareas.length - 5} más`
                : tareasList;
            throw new common_1.ConflictException(`No se puede eliminar la fase porque tiene ${tareas.length} tarea(s) asignada(s): ${mensaje}. Elimine las tareas primero.`);
        }
        return this.repo.delete(id);
    }
    async findByProject(projectId) {
        return this.repo.find({
            where: { id_proyecto: projectId },
            relations: ['tareas'],
            order: { orden: 'ASC' }
        });
    }
    async reorderPhases(projectId, newOrder) {
        const fasesIds = newOrder.map(item => item.id_fase);
        const fases = await this.repo.find({
            where: { id_proyecto: projectId }
        });
        const fasesIdsExistentes = fases.map(f => f.id_fase);
        const fasesInvalidas = fasesIds.filter(id => !fasesIdsExistentes.includes(id));
        if (fasesInvalidas.length > 0) {
            throw new common_1.BadRequestException(`Las siguientes fases no pertenecen a este proyecto: ${fasesInvalidas.join(', ')}`);
        }
        const ordenes = newOrder.map(item => item.orden);
        const ordenesUnicos = new Set(ordenes);
        if (ordenes.length !== ordenesUnicos.size) {
            throw new common_1.BadRequestException('No puede haber órdenes duplicados');
        }
        const updates = newOrder.map(item => this.repo.update(item.id_fase, { orden: item.orden }));
        await Promise.all(updates);
        return this.findByProject(projectId);
    }
};
exports.FaseService = FaseService;
exports.FaseService = FaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fase_entity_1.Fase)),
    __param(1, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(2, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FaseService);
//# sourceMappingURL=fase.service.js.map