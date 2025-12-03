"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const mensaje_entity_1 = require("./mensaje.entity");
const conversacion_entity_1 = require("./conversacion.entity");
const mensaje_service_1 = require("./mensaje.service");
const mensaje_controller_1 = require("./mensaje.controller");
const mensaje_gateway_1 = require("./mensaje.gateway");
let MensajeModule = class MensajeModule {
};
exports.MensajeModule = MensajeModule;
exports.MensajeModule = MensajeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([mensaje_entity_1.Mensaje, conversacion_entity_1.Conversacion]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
            }),
        ],
        controllers: [mensaje_controller_1.MensajeController],
        providers: [mensaje_service_1.MensajeService, mensaje_gateway_1.MensajeGateway],
        exports: [mensaje_service_1.MensajeService, mensaje_gateway_1.MensajeGateway],
    })
], MensajeModule);
//# sourceMappingURL=mensaje.module.js.map