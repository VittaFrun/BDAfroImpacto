"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const reporte_controller_1 = require("./reporte.controller");
const reporte_generator_service_1 = require("./reporte-generator.service");
const reporte_processor_1 = require("./reporte-processor");
const reporte_entity_1 = require("./reporte.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const fase_entity_1 = require("../fase/fase.entity");
const user_entity_1 = require("../users/user.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
let ReporteModule = class ReporteModule {
};
exports.ReporteModule = ReporteModule;
exports.ReporteModule = ReporteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                reporte_entity_1.Reporte,
                proyecto_entity_1.Proyecto,
                horas_voluntariadas_entity_1.HorasVoluntariadas,
                asignacion_entity_1.Asignacion,
                tarea_entity_1.Tarea,
                fase_entity_1.Fase,
                user_entity_1.Usuario,
                voluntario_entity_1.Voluntario
            ]),
            bull_1.BullModule.registerQueue({
                name: 'reportes',
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
            }),
        ],
        controllers: [reporte_controller_1.ReporteController],
        providers: [reporte_generator_service_1.ReporteGeneratorService, reporte_processor_1.ReporteProcessor, analytics_service_1.AnalyticsService],
        exports: [reporte_generator_service_1.ReporteGeneratorService, analytics_service_1.AnalyticsService],
    })
], ReporteModule);
//# sourceMappingURL=reporte.module.js.map