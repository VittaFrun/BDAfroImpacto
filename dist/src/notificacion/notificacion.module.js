"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const notificacion_entity_1 = require("./notificacion.entity");
const notificacion_service_1 = require("./notificacion.service");
const notificacion_controller_1 = require("./notificacion.controller");
const recordatorios_service_1 = require("./recordatorios.service");
const user_entity_1 = require("../users/user.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
let NotificacionModule = class NotificacionModule {
};
exports.NotificacionModule = NotificacionModule;
exports.NotificacionModule = NotificacionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notificacion_entity_1.Notificacion, user_entity_1.Usuario, proyecto_entity_1.Proyecto, tarea_entity_1.Tarea, asignacion_entity_1.Asignacion, organizacion_entity_1.Organizacion, voluntario_entity_1.Voluntario]),
            schedule_1.ScheduleModule.forRoot()
        ],
        controllers: [notificacion_controller_1.NotificacionController],
        providers: [notificacion_service_1.NotificacionService, recordatorios_service_1.RecordatoriosService],
        exports: [notificacion_service_1.NotificacionService],
    })
], NotificacionModule);
//# sourceMappingURL=notificacion.module.js.map