"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizacionMiembroModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organizacion_miembro_entity_1 = require("./organizacion-miembro.entity");
const organizacion_miembro_service_1 = require("./organizacion-miembro.service");
const organizacion_miembro_controller_1 = require("./organizacion-miembro.controller");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
let OrganizacionMiembroModule = class OrganizacionMiembroModule {
};
exports.OrganizacionMiembroModule = OrganizacionMiembroModule;
exports.OrganizacionMiembroModule = OrganizacionMiembroModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([organizacion_miembro_entity_1.OrganizacionMiembro, organizacion_entity_1.Organizacion, voluntario_entity_1.Voluntario, rol_entity_1.Rol])
        ],
        controllers: [organizacion_miembro_controller_1.OrganizacionMiembroController],
        providers: [organizacion_miembro_service_1.OrganizacionMiembroService],
        exports: [organizacion_miembro_service_1.OrganizacionMiembroService]
    })
], OrganizacionMiembroModule);
//# sourceMappingURL=organizacion-miembro.module.js.map