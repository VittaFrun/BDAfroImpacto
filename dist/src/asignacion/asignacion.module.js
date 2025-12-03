"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const asignacion_entity_1 = require("./asignacion.entity");
const asignacion_service_1 = require("./asignacion.service");
const asignacion_controller_1 = require("./asignacion.controller");
const smart_assignment_service_1 = require("./smart-assignment.service");
const tarea_entity_1 = require("../tarea/tarea.entity");
const fase_entity_1 = require("../fase/fase.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
const eliminacion_historial_module_1 = require("../eliminacion-historial/eliminacion-historial.module");
const notificacion_module_1 = require("../notificacion/notificacion.module");
let AsignacionModule = class AsignacionModule {
};
exports.AsignacionModule = AsignacionModule;
exports.AsignacionModule = AsignacionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([asignacion_entity_1.Asignacion, tarea_entity_1.Tarea, fase_entity_1.Fase, proyecto_entity_1.Proyecto, organizacion_entity_1.Organizacion, voluntario_entity_1.Voluntario, rol_entity_1.Rol]),
            eliminacion_historial_module_1.EliminacionHistorialModule,
            notificacion_module_1.NotificacionModule,
        ],
        controllers: [asignacion_controller_1.AsignacionController],
        providers: [asignacion_service_1.AsignacionService, smart_assignment_service_1.SmartAssignmentService],
    })
], AsignacionModule);
//# sourceMappingURL=asignacion.module.js.map