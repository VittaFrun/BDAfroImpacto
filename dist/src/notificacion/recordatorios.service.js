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
exports.RecordatoriosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const tarea_entity_1 = require("../tarea/tarea.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const notificacion_service_1 = require("./notificacion.service");
let RecordatoriosService = class RecordatoriosService {
    constructor(tareaRepo, asignacionRepo, notificacionService) {
        this.tareaRepo = tareaRepo;
        this.asignacionRepo = asignacionRepo;
        this.notificacionService = notificacionService;
    }
    async verificarTareasProximasAVencer() {
        var _a, _b;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(fechaLimite.getDate() + 3);
        const tareas = await this.tareaRepo
            .createQueryBuilder('tarea')
            .innerJoin('tarea.fase', 'fase')
            .innerJoin('fase.proyecto', 'proyecto')
            .where('tarea.fecha_fin IS NOT NULL')
            .andWhere('tarea.fecha_fin >= :hoy', { hoy })
            .andWhere('tarea.fecha_fin <= :fechaLimite', { fechaLimite })
            .andWhere('tarea.id_estado NOT IN (:...estadosCompletados)', {
            estadosCompletados: [3, 4],
        })
            .getMany();
        for (const tarea of tareas) {
            const asignaciones = await this.asignacionRepo.find({
                where: { id_tarea: tarea.id_tarea },
                relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase', 'tarea.fase.proyecto'],
            });
            if (tarea.fecha_fin) {
                const fechaFin = new Date(tarea.fecha_fin);
                const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                for (const asignacion of asignaciones) {
                    if ((_a = asignacion.voluntario) === null || _a === void 0 ? void 0 : _a.usuario) {
                        try {
                            await this.notificacionService.notificarTareaProximaVencer(asignacion.voluntario.id_voluntario, ((_b = asignacion.tarea.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) || null, tarea.id_tarea, tarea.descripcion || 'Tarea sin nombre', fechaFin, diasRestantes);
                        }
                        catch (error) {
                            console.error(`Error al notificar tarea próxima a vencer para voluntario ${asignacion.voluntario.id_voluntario}:`, error);
                        }
                    }
                }
            }
        }
    }
    async verificarTareasPendientes() {
        var _a, _b;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(fechaLimite.getDate() - 7);
        const tareas = await this.tareaRepo
            .createQueryBuilder('tarea')
            .innerJoin('tarea.fase', 'fase')
            .innerJoin('fase.proyecto', 'proyecto')
            .where('tarea.id_estado IN (:...estadosPendientes)', {
            estadosPendientes: [1, 2],
        })
            .andWhere('(tarea.actualizado_en IS NULL OR tarea.actualizado_en < :fechaLimite)', {
            fechaLimite,
        })
            .getMany();
        for (const tarea of tareas) {
            const asignaciones = await this.asignacionRepo.find({
                where: { id_tarea: tarea.id_tarea },
                relations: ['voluntario', 'voluntario.usuario', 'tarea', 'tarea.fase', 'tarea.fase.proyecto'],
            });
            const ultimaActualizacion = tarea.actualizado_en || tarea.creado_en || new Date();
            const diasSinActividad = Math.floor((hoy.getTime() - new Date(ultimaActualizacion).getTime()) / (1000 * 60 * 60 * 24));
            if (diasSinActividad >= 7) {
                for (const asignacion of asignaciones) {
                    if ((_a = asignacion.voluntario) === null || _a === void 0 ? void 0 : _a.usuario) {
                        try {
                            await this.notificacionService.notificarTareaPendiente(asignacion.voluntario.id_voluntario, ((_b = asignacion.tarea.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) || null, tarea.id_tarea, tarea.descripcion || 'Tarea sin nombre', diasSinActividad);
                        }
                        catch (error) {
                            console.error(`Error al notificar tarea pendiente para voluntario ${asignacion.voluntario.id_voluntario}:`, error);
                        }
                    }
                }
            }
        }
    }
};
exports.RecordatoriosService = RecordatoriosService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordatoriosService.prototype, "verificarTareasProximasAVencer", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordatoriosService.prototype, "verificarTareasPendientes", null);
exports.RecordatoriosService = RecordatoriosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(1, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService])
], RecordatoriosService);
//# sourceMappingURL=recordatorios.service.js.map