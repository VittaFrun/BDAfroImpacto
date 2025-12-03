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
exports.ReporteController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const reporte_generator_service_1 = require("./reporte-generator.service");
const create_reporte_dto_1 = require("./create-reporte.dto");
const analytics_service_1 = require("../analytics/analytics.service");
let ReporteController = class ReporteController {
    constructor(reporteService, analyticsService) {
        this.reporteService = reporteService;
        this.analyticsService = analyticsService;
    }
    async generateReport(dto, req) {
        const options = {
            incluirGraficos: dto.incluir_graficos,
            incluirDetalles: dto.incluir_detalles,
            incluirHoras: dto.incluir_horas,
            incluirVoluntarios: dto.incluir_voluntarios,
            fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
            fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
            formato: dto.formato,
            plantilla: dto.plantilla
        };
        return await this.reporteService.generateReportAsync(dto.id_proyecto, dto.tipo, dto.formato, options, req.user);
    }
    async generateSimpleReport(dto, req, res) {
        if (dto.formato === 'PDF' && dto.incluir_graficos) {
            throw new common_1.BadRequestException('Los reportes PDF con gráficos deben generarse de forma asíncrona');
        }
        const options = {
            incluirGraficos: false,
            incluirDetalles: dto.incluir_detalles,
            incluirHoras: dto.incluir_horas,
            incluirVoluntarios: dto.incluir_voluntarios,
            fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
            fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
            formato: dto.formato,
            plantilla: dto.plantilla
        };
        const buffer = await this.reporteService.generateReportSync(dto.id_proyecto, dto.tipo, dto.formato, options, req.user);
        const fileName = `reporte_${dto.tipo}_${Date.now()}.${dto.formato.toLowerCase()}`;
        const mimeTypes = {
            'PDF': 'application/pdf',
            'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'CSV': 'text/csv'
        };
        res.setHeader('Content-Type', mimeTypes[dto.formato]);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    }
    async getReportStatus(id) {
        return await this.reporteService.getReportStatus(id);
    }
    async downloadReport(id, req, res) {
        const buffer = await this.reporteService.downloadReport(id, req.user);
        const reporte = await this.reporteService.getReportStatus(id);
        const fileName = `reporte_${reporte.tipo}_${reporte.id_reporte}.${reporte.formato.toLowerCase()}`;
        const mimeTypes = {
            'PDF': 'application/pdf',
            'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'CSV': 'text/csv'
        };
        res.setHeader('Content-Type', mimeTypes[reporte.formato]);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    }
    async getProjectAnalytics() {
        return await this.analyticsService.getProjectAnalytics();
    }
    async getOrganizationAnalytics(id) {
        return await this.analyticsService.getOrganizationAnalytics(id);
    }
    async getVolunteerAnalytics(id) {
        return await this.analyticsService.getVolunteerAnalytics(id);
    }
    async getProjectReports(projectId, req) {
        await this.reporteService['validateProjectAccess'](projectId, req.user);
        return { message: 'Lista de reportes del proyecto', projectId };
    }
};
exports.ReporteController = ReporteController;
__decorate([
    (0, common_1.Post)('generar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reporte_dto_1.CreateReporteDto, Object]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Post)('generar-simple'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reporte_dto_1.CreateReporteDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "generateSimpleReport", null);
__decorate([
    (0, common_1.Get)(':id/estado'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "getReportStatus", null);
__decorate([
    (0, common_1.Get)(':id/descargar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "downloadReport", null);
__decorate([
    (0, common_1.Get)('analytics/proyectos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "getProjectAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/organizacion/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "getOrganizationAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/voluntario/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "getVolunteerAnalytics", null);
__decorate([
    (0, common_1.Get)('proyecto/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReporteController.prototype, "getProjectReports", null);
exports.ReporteController = ReporteController = __decorate([
    (0, common_1.Controller)('reportes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [reporte_generator_service_1.ReporteGeneratorService,
        analytics_service_1.AnalyticsService])
], ReporteController);
//# sourceMappingURL=reporte.controller.js.map