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
exports.OrganizacionMiembroController = void 0;
const common_1 = require("@nestjs/common");
const organizacion_miembro_service_1 = require("./organizacion-miembro.service");
const update_organizacion_miembro_dto_1 = require("./update-organizacion-miembro.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
let OrganizacionMiembroController = class OrganizacionMiembroController {
    constructor(service) {
        this.service = service;
    }
    findAllByOrganization(id, user) {
        return this.service.findAllByOrganization(id, user);
    }
    solicitarUnirse(id_organizacion, user) {
        return this.service.solicitarUnirse(id_organizacion, user.id_usuario);
    }
    aprobarSolicitud(id_organizacion, miembroId, body, user) {
        return this.service.aprobarSolicitud(miembroId, body.id_rol_organizacion || null, user);
    }
    update(id_organizacion, miembroId, dto, user) {
        return this.service.update(miembroId, dto, user);
    }
    remove(id_organizacion, miembroId, user) {
        return this.service.remove(miembroId, user);
    }
};
exports.OrganizacionMiembroController = OrganizacionMiembroController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'organizacion', 'voluntario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], OrganizacionMiembroController.prototype, "findAllByOrganization", null);
__decorate([
    (0, common_1.Post)('solicitar'),
    (0, roles_decorator_1.Roles)('voluntario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], OrganizacionMiembroController.prototype, "solicitarUnirse", null);
__decorate([
    (0, common_1.Post)('aprobar/:miembroId'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('miembroId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], OrganizacionMiembroController.prototype, "aprobarSolicitud", null);
__decorate([
    (0, common_1.Patch)(':miembroId'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('miembroId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, update_organizacion_miembro_dto_1.UpdateOrganizacionMiembroDto,
        user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], OrganizacionMiembroController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':miembroId'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('miembroId', common_1.ParseIntPipe)),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], OrganizacionMiembroController.prototype, "remove", null);
exports.OrganizacionMiembroController = OrganizacionMiembroController = __decorate([
    (0, common_1.Controller)('organizaciones/:id/equipo'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [organizacion_miembro_service_1.OrganizacionMiembroService])
], OrganizacionMiembroController);
//# sourceMappingURL=organizacion-miembro.controller.js.map