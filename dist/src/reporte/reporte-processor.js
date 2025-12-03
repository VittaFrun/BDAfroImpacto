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
var ReporteProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reporte_entity_1 = require("./reporte.entity");
const reporte_generator_service_1 = require("./reporte-generator.service");
const user_entity_1 = require("../users/user.entity");
const fs = require("fs");
const path = require("path");
let ReporteProcessor = ReporteProcessor_1 = class ReporteProcessor {
    constructor(reporteRepo, usuarioRepo, reporteGenerator) {
        this.reporteRepo = reporteRepo;
        this.usuarioRepo = usuarioRepo;
        this.reporteGenerator = reporteGenerator;
        this.logger = new common_1.Logger(ReporteProcessor_1.name);
    }
    async handleReportGeneration(job) {
        const { reporteId, projectId, tipo, formato, options, userId } = job.data;
        this.logger.log(`Iniciando generación de reporte ${reporteId} para proyecto ${projectId}`);
        try {
            await this.reporteRepo.update(reporteId, {
                estado: 'generando',
                actualizado_en: new Date()
            });
            const user = await this.usuarioRepo.findOne({
                where: { id_usuario: userId }
            });
            if (!user) {
                throw new Error(`Usuario con ID ${userId} no encontrado`);
            }
            const reportBuffer = await this.reporteGenerator.generateReportSync(projectId, tipo, formato, options, user);
            const fileName = `reporte_${reporteId}_${Date.now()}.${formato.toLowerCase()}`;
            const filePath = await this.saveReportFile(fileName, reportBuffer);
            await this.reporteRepo.update(reporteId, {
                estado: 'listo',
                contenido: filePath,
                actualizado_en: new Date()
            });
            this.logger.log(`Reporte ${reporteId} generado exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error generando reporte ${reporteId}:`, error);
            await this.reporteRepo.update(reporteId, {
                estado: 'error',
                contenido: error.message,
                actualizado_en: new Date()
            });
            throw error;
        }
    }
    async saveReportFile(fileName, buffer) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'reportes');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        return filePath;
    }
};
exports.ReporteProcessor = ReporteProcessor;
__decorate([
    (0, bull_1.Process)('generate-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReporteProcessor.prototype, "handleReportGeneration", null);
exports.ReporteProcessor = ReporteProcessor = ReporteProcessor_1 = __decorate([
    (0, bull_1.Processor)('reportes'),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reporte_entity_1.Reporte)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        reporte_generator_service_1.ReporteGeneratorService])
], ReporteProcessor);
//# sourceMappingURL=reporte-processor.js.map