"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EliminacionHistorialController = void 0;
const common_1 = require("@nestjs/common");
const eliminacion_historial_service_1 = require("./eliminacion-historial.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
let EliminacionHistorialController = class EliminacionHistorialController {
    constructor(service) {
        this.service = service;
    }
    findByProyecto(idProyecto) {
        return this.service.findByProyecto(+idProyecto);
    }
    findByUsuario(user) {
        return this.service.findByUsuario(user.id_usuario);
    }
    findByTipoEntidad(tipoEntidad, idProyecto) {
        return this.service.findByTipoEntidad(tipoEntidad, idProyecto ? +idProyecto : undefined);
    }
    findRecent(idProyecto) {
        return this.service.findRecent(idProyecto ? +idProyecto : undefined);
    }
};
exports.EliminacionHistorialController = EliminacionHistorialController;
__decorate([
    (0, common_1.Get)('proyecto/:idProyecto'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('idProyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EliminacionHistorialController.prototype, "findByProyecto", null);
__decorate([
    (0, common_1.Get)('usuario/mis-eliminaciones'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], EliminacionHistorialController.prototype, "findByUsuario", null);
__decorate([
    (0, common_1.Get)('tipo/:tipoEntidad'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('tipoEntidad')),
    __param(1, (0, common_1.Query)('idProyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EliminacionHistorialController.prototype, "findByTipoEntidad", null);
__decorate([
    (0, common_1.Get)('recientes'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Query)('idProyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EliminacionHistorialController.prototype, "findRecent", null);
exports.EliminacionHistorialController = EliminacionHistorialController = __decorate([
    (0, common_1.Controller)('eliminacion-historial'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [eliminacion_historial_service_1.EliminacionHistorialService])
], EliminacionHistorialController);
//# sourceMappingURL=eliminacion-historial.controller.js.map