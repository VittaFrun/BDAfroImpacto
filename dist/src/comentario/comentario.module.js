"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComentarioModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comentario_service_1 = require("./comentario.service");
const comentario_controller_1 = require("./comentario.controller");
const comentario_entity_1 = require("./comentario.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const fase_entity_1 = require("../fase/fase.entity");
const user_entity_1 = require("../users/user.entity");
const notificacion_module_1 = require("../notificacion/notificacion.module");
let ComentarioModule = class ComentarioModule {
};
exports.ComentarioModule = ComentarioModule;
exports.ComentarioModule = ComentarioModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([comentario_entity_1.Comentario, tarea_entity_1.Tarea, proyecto_entity_1.Proyecto, fase_entity_1.Fase, user_entity_1.Usuario]),
            notificacion_module_1.NotificacionModule,
        ],
        controllers: [comentario_controller_1.ComentarioController],
        providers: [comentario_service_1.ComentarioService],
        exports: [comentario_service_1.ComentarioService],
    })
], ComentarioModule);
//# sourceMappingURL=comentario.module.js.map