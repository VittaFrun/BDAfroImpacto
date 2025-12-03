"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EliminacionHistorialModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const eliminacion_historial_entity_1 = require("./eliminacion-historial.entity");
const eliminacion_historial_service_1 = require("./eliminacion-historial.service");
const eliminacion_historial_controller_1 = require("./eliminacion-historial.controller");
const user_entity_1 = require("../users/user.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let EliminacionHistorialModule = class EliminacionHistorialModule {
};
exports.EliminacionHistorialModule = EliminacionHistorialModule;
exports.EliminacionHistorialModule = EliminacionHistorialModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([eliminacion_historial_entity_1.EliminacionHistorial, user_entity_1.Usuario, proyecto_entity_1.Proyecto])],
        controllers: [eliminacion_historial_controller_1.EliminacionHistorialController],
        providers: [eliminacion_historial_service_1.EliminacionHistorialService],
        exports: [eliminacion_historial_service_1.EliminacionHistorialService],
    })
], EliminacionHistorialModule);
//# sourceMappingURL=eliminacion-historial.module.js.map