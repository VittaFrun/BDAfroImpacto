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
exports.HistorialCambiosController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const historial_cambios_service_1 = require("./historial-cambios.service");
let HistorialCambiosController = class HistorialCambiosController {
    constructor(historialService) {
        this.historialService = historialService;
    }
    async getEntityHistory(tipo, id, limite) {
        const limiteNum = limite ? parseInt(limite) : 50;
        return await this.historialService.obtenerHistorialEntidad(tipo, id, limiteNum);
    }
    async getProjectHistory(id, limite) {
        const limiteNum = limite ? parseInt(limite) : 100;
        return await this.historialService.obtenerHistorialProyecto(id, limiteNum);
    }
    async getHistoryStats(proyecto) {
        const proyectoId = proyecto ? parseInt(proyecto) : undefined;
        return await this.historialService.obtenerEstadisticasHistorial(proyectoId);
    }
    async restoreVersion(body, req) {
        return await this.historialService.restaurarVersion(body.tipo_entidad, body.id_entidad, body.id_historial, req.user);
    }
};
exports.HistorialCambiosController = HistorialCambiosController;
__decorate([
    (0, common_1.Get)('entidad/:tipo/:id'),
    __param(0, (0, common_1.Param)('tipo')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], HistorialCambiosController.prototype, "getEntityHistory", null);
__decorate([
    (0, common_1.Get)('proyecto/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limite')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], HistorialCambiosController.prototype, "getProjectHistory", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Query)('proyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HistorialCambiosController.prototype, "getHistoryStats", null);
__decorate([
    (0, common_1.Post)('restaurar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HistorialCambiosController.prototype, "restoreVersion", null);
exports.HistorialCambiosController = HistorialCambiosController = __decorate([
    (0, common_1.Controller)('historial'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [historial_cambios_service_1.HistorialCambiosService])
], HistorialCambiosController);
//# sourceMappingURL=historial-cambios.controller.js.map