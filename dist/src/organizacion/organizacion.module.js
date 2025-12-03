"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organizacion_entity_1 = require("./organizacion.entity");
const organizacion_service_1 = require("./organizacion.service");
const organizacion_controller_1 = require("./organizacion.controller");
const user_entity_1 = require("../users/user.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let OrganizacionModule = class OrganizacionModule {
};
exports.OrganizacionModule = OrganizacionModule;
exports.OrganizacionModule = OrganizacionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([organizacion_entity_1.Organizacion, user_entity_1.Usuario, proyecto_entity_1.Proyecto])],
        controllers: [organizacion_controller_1.OrganizacionController],
        providers: [organizacion_service_1.OrganizacionService],
        exports: [organizacion_service_1.OrganizacionService],
    })
], OrganizacionModule);
//# sourceMappingURL=organizacion.module.js.map