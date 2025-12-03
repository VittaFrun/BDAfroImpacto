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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const fase_entity_1 = require("../fase/fase.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
let AnalyticsService = class AnalyticsService {
    constructor(proyectoRepo, tareaRepo, faseRepo, horasRepo, asignacionRepo, voluntarioRepo) {
        this.proyectoRepo = proyectoRepo;
        this.tareaRepo = tareaRepo;
        this.faseRepo = faseRepo;
        this.horasRepo = horasRepo;
        this.asignacionRepo = asignacionRepo;
        this.voluntarioRepo = voluntarioRepo;
    }
    async getProjectAnalytics() {
        const [totalProyectos, proyectosActivos, proyectosCompletados] = await Promise.all([
            this.proyectoRepo.count(),
            this.proyectoRepo.count({ where: { id_estado: 2 } }),
            this.proyectoRepo.count({ where: { id_estado: 3 } }),
        ]);
        const totalVoluntarios = await this.voluntarioRepo.count();
        const totalHorasResult = await this.horasRepo
            .createQueryBuilder('horas')
            .select('SUM(horas.horas_trabajadas)', 'total')
            .getRawOne();
        const totalHoras = parseFloat((totalHorasResult === null || totalHorasResult === void 0 ? void 0 : totalHorasResult.total) || '0');
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 12);
        const proyectosPorMes = await this.proyectoRepo
            .createQueryBuilder('proyecto')
            .select('YEAR(proyecto.creado_en) as año, MONTH(proyecto.creado_en) as mes, COUNT(*) as total')
            .where('proyecto.creado_en >= :fechaInicio', { fechaInicio })
            .groupBy('YEAR(proyecto.creado_en), MONTH(proyecto.creado_en)')
            .orderBy('año, mes')
            .getRawMany();
        const horasPorMes = await this.horasRepo
            .createQueryBuilder('horas')
            .select('YEAR(horas.fecha) as año, MONTH(horas.fecha) as mes, SUM(horas.horas_trabajadas) as total')
            .where('horas.fecha >= :fechaInicio', { fechaInicio })
            .groupBy('YEAR(horas.fecha), MONTH(horas.fecha)')
            .orderBy('año, mes')
            .getRawMany();
        const voluntariosPorMes = await this.voluntarioRepo
            .createQueryBuilder('voluntario')
            .select('YEAR(voluntario.creado_en) as año, MONTH(voluntario.creado_en) as mes, COUNT(*) as total')
            .where('voluntario.creado_en >= :fechaInicio', { fechaInicio })
            .groupBy('YEAR(voluntario.creado_en), MONTH(voluntario.creado_en)')
            .orderBy('año, mes')
            .getRawMany();
        const proyectosConFechas = await this.proyectoRepo
            .createQueryBuilder('proyecto')
            .where('proyecto.fecha_fin IS NOT NULL')
            .andWhere('proyecto.id_estado = 3')
            .getMany();
        let promedioCompletacion = 0;
        if (proyectosConFechas.length > 0) {
            const tiemposCompletacion = proyectosConFechas.map(p => {
                const inicio = new Date(p.fecha_inicio);
                const fin = new Date(p.fecha_fin);
                return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
            });
            promedioCompletacion = tiemposCompletacion.reduce((a, b) => a + b, 0) / tiemposCompletacion.length;
        }
        const eficienciaHoras = await this.calculateHourEfficiency();
        const fechaRetencion = new Date();
        fechaRetencion.setMonth(fechaRetencion.getMonth() - 3);
        const voluntariosActivos = await this.horasRepo
            .createQueryBuilder('horas')
            .select('COUNT(DISTINCT horas.id_voluntario)', 'total')
            .where('horas.fecha >= :fechaRetencion', { fechaRetencion })
            .getRawOne();
        const retencionVoluntarios = totalVoluntarios > 0
            ? (parseInt(voluntariosActivos.total) / totalVoluntarios) * 100
            : 0;
        return {
            resumen: {
                totalProyectos,
                proyectosActivos,
                proyectosCompletados,
                totalVoluntarios,
                totalHoras: Math.round(totalHoras * 100) / 100
            },
            tendencias: {
                proyectosPorMes: proyectosPorMes.map(p => ({
                    periodo: `${p.año}-${String(p.mes).padStart(2, '0')}`,
                    total: parseInt(p.total)
                })),
                horasPorMes: horasPorMes.map(h => ({
                    periodo: `${h.año}-${String(h.mes).padStart(2, '0')}`,
                    total: parseFloat(h.total)
                })),
                voluntariosPorMes: voluntariosPorMes.map(v => ({
                    periodo: `${v.año}-${String(v.mes).padStart(2, '0')}`,
                    total: parseInt(v.total)
                }))
            },
            rendimiento: {
                promedioCompletacion: Math.round(promedioCompletacion),
                eficienciaHoras: Math.round(eficienciaHoras * 100) / 100,
                retencionVoluntarios: Math.round(retencionVoluntarios * 100) / 100
            }
        };
    }
    async getOrganizationAnalytics(organizacionId) {
        const [total, activos, completados, enPausa] = await Promise.all([
            this.proyectoRepo.count({ where: { id_organizacion: organizacionId } }),
            this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 2 } }),
            this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 3 } }),
            this.proyectoRepo.count({ where: { id_organizacion: organizacionId, id_estado: 4 } }),
        ]);
        const voluntariosUnicos = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .leftJoin('tarea.fase', 'fase')
            .leftJoin('fase.proyecto', 'proyecto')
            .select('COUNT(DISTINCT asignacion.id_voluntario)', 'total')
            .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
            .getRawOne();
        const fechaActividad = new Date();
        fechaActividad.setDate(fechaActividad.getDate() - 30);
        const voluntariosActivos = await this.horasRepo
            .createQueryBuilder('horas')
            .leftJoin('horas.proyecto', 'proyecto')
            .select('COUNT(DISTINCT horas.id_voluntario)', 'total')
            .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
            .andWhere('horas.fecha >= :fechaActividad', { fechaActividad })
            .getRawOne();
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const nuevosVoluntarios = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .leftJoin('tarea.fase', 'fase')
            .leftJoin('fase.proyecto', 'proyecto')
            .leftJoin('asignacion.voluntario', 'voluntario')
            .select('COUNT(DISTINCT asignacion.id_voluntario)', 'total')
            .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
            .andWhere('voluntario.creado_en >= :inicioMes', { inicioMes })
            .getRawOne();
        const horasStats = await this.horasRepo
            .createQueryBuilder('horas')
            .leftJoin('horas.proyecto', 'proyecto')
            .select([
            'SUM(horas.horas_trabajadas) as totalRegistradas',
            'SUM(CASE WHEN horas.verificada = 1 THEN horas.horas_trabajadas ELSE 0 END) as totalVerificadas'
        ])
            .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
            .getRawOne();
        const hace4Semanas = new Date();
        hace4Semanas.setDate(hace4Semanas.getDate() - 28);
        const horasSemanales = await this.horasRepo
            .createQueryBuilder('horas')
            .leftJoin('horas.proyecto', 'proyecto')
            .select('SUM(horas.horas_trabajadas) / 4', 'promedio')
            .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
            .andWhere('horas.fecha >= :hace4Semanas', { hace4Semanas })
            .getRawOne();
        const tendenciaHoras = await this.calculateHoursTrend(organizacionId);
        const tareasATiempo = await this.calculateTasksOnTime(organizacionId);
        return {
            proyectos: {
                total,
                activos,
                completados,
                enPausa
            },
            voluntarios: {
                total: parseInt(voluntariosUnicos.total),
                activos: parseInt(voluntariosActivos.total),
                nuevosEsteMes: parseInt(nuevosVoluntarios.total),
                retencion: parseInt(voluntariosUnicos.total) > 0
                    ? Math.round((parseInt(voluntariosActivos.total) / parseInt(voluntariosUnicos.total)) * 100)
                    : 0
            },
            horas: {
                totalRegistradas: Math.round(parseFloat(horasStats.totalRegistradas || '0') * 100) / 100,
                totalVerificadas: Math.round(parseFloat(horasStats.totalVerificadas || '0') * 100) / 100,
                promedioSemanal: Math.round(parseFloat(horasSemanales.promedio || '0') * 100) / 100,
                tendencia: tendenciaHoras
            },
            rendimiento: {
                tareasCompletadasATiempo: tareasATiempo,
                satisfaccionVoluntarios: 85,
                eficienciaProyectos: Math.round((completados / (total || 1)) * 100)
            }
        };
    }
    async getVolunteerAnalytics(voluntarioId) {
        const proyectosParticipados = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .leftJoin('tarea.fase', 'fase')
            .select('COUNT(DISTINCT fase.id_proyecto)', 'total')
            .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
            .getRawOne();
        const tareasCompletadas = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .select('COUNT(*)', 'total')
            .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
            .andWhere('tarea.id_estado = 3')
            .getRawOne();
        const horasContribuidas = await this.horasRepo
            .createQueryBuilder('horas')
            .select('SUM(horas.horas_trabajadas)', 'total')
            .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
            .getRawOne();
        const diasActivo = await this.horasRepo
            .createQueryBuilder('horas')
            .select('COUNT(DISTINCT DATE(horas.fecha))', 'total')
            .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
            .getRawOne();
        const tareasATiempoResult = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .select('COUNT(*)', 'total')
            .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
            .andWhere('tarea.id_estado = 3')
            .andWhere('tarea.actualizado_en <= tarea.fecha_fin')
            .getRawOne();
        const tareasATiempo = parseInt(tareasCompletadas.total) > 0
            ? Math.round((parseInt(tareasATiempoResult.total) / parseInt(tareasCompletadas.total)) * 100)
            : 0;
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 12);
        const horasPorMes = await this.horasRepo
            .createQueryBuilder('horas')
            .select('YEAR(horas.fecha) as año, MONTH(horas.fecha) as mes, SUM(horas.horas_trabajadas) as total')
            .where('horas.id_voluntario = :voluntarioId', { voluntarioId })
            .andWhere('horas.fecha >= :fechaInicio', { fechaInicio })
            .groupBy('YEAR(horas.fecha), MONTH(horas.fecha)')
            .orderBy('año, mes')
            .getRawMany();
        const tareasCompletadasPorMes = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .leftJoin('asignacion.tarea', 'tarea')
            .select('YEAR(tarea.actualizado_en) as año, MONTH(tarea.actualizado_en) as mes, COUNT(*) as total')
            .where('asignacion.id_voluntario = :voluntarioId', { voluntarioId })
            .andWhere('tarea.id_estado = 3')
            .andWhere('tarea.actualizado_en >= :fechaInicio', { fechaInicio })
            .groupBy('YEAR(tarea.actualizado_en), MONTH(tarea.actualizado_en)')
            .orderBy('año, mes')
            .getRawMany();
        return {
            actividad: {
                proyectosParticipados: parseInt(proyectosParticipados.total),
                tareasCompletadas: parseInt(tareasCompletadas.total),
                horasContribuidas: Math.round(parseFloat(horasContribuidas.total || '0') * 100) / 100,
                diasActivo: parseInt(diasActivo.total)
            },
            rendimiento: {
                tareasATiempo,
                calificacionPromedio: 4.2,
                consistencia: this.calculateConsistency(horasPorMes)
            },
            progreso: {
                horasPorMes: horasPorMes.map(h => ({
                    periodo: `${h.año}-${String(h.mes).padStart(2, '0')}`,
                    total: parseFloat(h.total)
                })),
                tareasCompletadasPorMes: tareasCompletadasPorMes.map(t => ({
                    periodo: `${t.año}-${String(t.mes).padStart(2, '0')}`,
                    total: parseInt(t.total)
                })),
                habilidadesDesarrolladas: []
            }
        };
    }
    async calculateHourEfficiency() {
        return 85.5;
    }
    async calculateHoursTrend(organizacionId) {
        const hace2Semanas = new Date();
        hace2Semanas.setDate(hace2Semanas.getDate() - 14);
        const hace1Semana = new Date();
        hace1Semana.setDate(hace1Semana.getDate() - 7);
        const [horasSemanaAnterior, horasSemanaActual] = await Promise.all([
            this.horasRepo
                .createQueryBuilder('horas')
                .leftJoin('horas.proyecto', 'proyecto')
                .select('SUM(horas.horas_trabajadas)', 'total')
                .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
                .andWhere('horas.fecha >= :hace2Semanas', { hace2Semanas })
                .andWhere('horas.fecha < :hace1Semana', { hace1Semana })
                .getRawOne(),
            this.horasRepo
                .createQueryBuilder('horas')
                .leftJoin('horas.proyecto', 'proyecto')
                .select('SUM(horas.horas_trabajadas)', 'total')
                .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
                .andWhere('horas.fecha >= :hace1Semana', { hace1Semana })
                .getRawOne()
        ]);
        const anterior = parseFloat(horasSemanaAnterior.total || '0');
        const actual = parseFloat(horasSemanaActual.total || '0');
        const diferencia = ((actual - anterior) / (anterior || 1)) * 100;
        if (diferencia > 5)
            return 'subiendo';
        if (diferencia < -5)
            return 'bajando';
        return 'estable';
    }
    async calculateTasksOnTime(organizacionId) {
        const [totalCompletadas, completadasATiempo] = await Promise.all([
            this.tareaRepo
                .createQueryBuilder('tarea')
                .leftJoin('tarea.fase', 'fase')
                .leftJoin('fase.proyecto', 'proyecto')
                .select('COUNT(*)', 'total')
                .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
                .andWhere('tarea.id_estado = 3')
                .getRawOne(),
            this.tareaRepo
                .createQueryBuilder('tarea')
                .leftJoin('tarea.fase', 'fase')
                .leftJoin('fase.proyecto', 'proyecto')
                .select('COUNT(*)', 'total')
                .where('proyecto.id_organizacion = :organizacionId', { organizacionId })
                .andWhere('tarea.id_estado = 3')
                .andWhere('tarea.actualizado_en <= tarea.fecha_fin')
                .getRawOne()
        ]);
        const total = parseInt(totalCompletadas.total);
        const aTiempo = parseInt(completadasATiempo.total);
        return total > 0 ? Math.round((aTiempo / total) * 100) : 0;
    }
    calculateConsistency(horasPorMes) {
        if (horasPorMes.length < 2)
            return 0;
        const valores = horasPorMes.map(h => parseFloat(h.total));
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        const varianza = valores.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / valores.length;
        const desviacion = Math.sqrt(varianza);
        const coeficienteVariacion = promedio > 0 ? (desviacion / promedio) : 1;
        return Math.max(0, Math.min(100, Math.round((1 - coeficienteVariacion) * 100)));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(1, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(2, (0, typeorm_1.InjectRepository)(fase_entity_1.Fase)),
    __param(3, (0, typeorm_1.InjectRepository)(horas_voluntariadas_entity_1.HorasVoluntariadas)),
    __param(4, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(5, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map