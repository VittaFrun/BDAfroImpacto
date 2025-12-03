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
exports.NotificacionController = void 0;
const common_1 = require("@nestjs/common");
const notificacion_service_1 = require("./notificacion.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
let NotificacionController = class NotificacionController {
    constructor(service) {
        this.service = service;
    }
    getMisNotificaciones(user, soloNoLeidas) {
        return this.service.findByUsuario(user.id_usuario, soloNoLeidas === 'true');
    }
    contarNoLeidas(user) {
        return this.service.contarNoLeidas(user.id_usuario);
    }
    marcarComoLeida(id, user) {
        return this.service.marcarComoLeida(+id, user.id_usuario);
    }
    marcarTodasComoLeidas(user) {
        return this.service.marcarTodasComoLeidas(user.id_usuario);
    }
    crear(dto) {
        return this.service.crear(dto);
    }
    eliminar(id, user) {
        return this.service.eliminar(+id, user.id_usuario);
    }
};
exports.NotificacionController = NotificacionController;
__decorate([
    (0, common_1.Get)('mis-notificaciones'),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('soloNoLeidas')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario, String]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "getMisNotificaciones", null);
__decorate([
    (0, common_1.Get)('contar-no-leidas'),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "contarNoLeidas", null);
__decorate([
    (0, common_1.Patch)(':id/leida'),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarComoLeida", null);
__decorate([
    (0, common_1.Patch)('marcar-todas-leidas'),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarTodasComoLeidas", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "crear", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "eliminar", null);
exports.NotificacionController = NotificacionController = __decorate([
    (0, common_1.Controller)('notificacion'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [notificacion_service_1.NotificacionService])
], NotificacionController);
//# sourceMappingURL=notificacion.controller.js.map