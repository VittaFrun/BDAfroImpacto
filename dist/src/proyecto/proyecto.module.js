"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProyectoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const proyecto_entity_1 = require("./proyecto.entity");
const proyecto_service_1 = require("./proyecto.service");
const proyecto_controller_1 = require("./proyecto.controller");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const fase_entity_1 = require("../fase/fase.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
const certificado_entity_1 = require("../certificado/certificado.entity");
const proyecto_beneficio_entity_1 = require("../proyecto-beneficio/proyecto-beneficio.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
const estado_entity_1 = require("../estado/estado.entity");
const solicitud_inscripcion_entity_1 = require("../solicitud-inscripcion/solicitud-inscripcion.entity");
const notificacion_module_1 = require("../notificacion/notificacion.module");
let ProyectoModule = class ProyectoModule {
};
exports.ProyectoModule = ProyectoModule;
exports.ProyectoModule = ProyectoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([proyecto_entity_1.Proyecto, organizacion_entity_1.Organizacion, fase_entity_1.Fase, tarea_entity_1.Tarea, horas_voluntariadas_entity_1.HorasVoluntariadas, certificado_entity_1.Certificado, proyecto_beneficio_entity_1.ProyectoBeneficio, asignacion_entity_1.Asignacion, voluntario_entity_1.Voluntario, rol_entity_1.Rol, estado_entity_1.Estado, solicitud_inscripcion_entity_1.SolicitudInscripcion]),
            notificacion_module_1.NotificacionModule
        ],
        controllers: [proyecto_controller_1.ProyectoController],
        providers: [proyecto_service_1.ProyectoService],
        exports: [proyecto_service_1.ProyectoService],
    })
], ProyectoModule);
//# sourceMappingURL=proyecto.module.js.map