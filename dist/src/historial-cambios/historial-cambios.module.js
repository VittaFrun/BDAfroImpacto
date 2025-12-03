"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistorialCambiosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const historial_cambios_service_1 = require("./historial-cambios.service");
const historial_cambios_controller_1 = require("./historial-cambios.controller");
const historial_cambios_entity_1 = require("./historial-cambios.entity");
let HistorialCambiosModule = class HistorialCambiosModule {
};
exports.HistorialCambiosModule = HistorialCambiosModule;
exports.HistorialCambiosModule = HistorialCambiosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([historial_cambios_entity_1.HistorialCambios]),
        ],
        controllers: [historial_cambios_controller_1.HistorialCambiosController],
        providers: [historial_cambios_service_1.HistorialCambiosService],
        exports: [historial_cambios_service_1.HistorialCambiosService],
    })
], HistorialCambiosModule);
//# sourceMappingURL=historial-cambios.module.js.map