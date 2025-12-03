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
exports.RolController = void 0;
const common_1 = require("@nestjs/common");
const rol_service_1 = require("./rol.service");
const create_rol_dto_1 = require("./create-rol.dto");
const update_rol_dto_1 = require("./update-rol.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
let RolController = class RolController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    findAll(tipo_rol, id_organizacion, id_proyecto) {
        const filters = {};
        if (tipo_rol)
            filters.tipo_rol = tipo_rol;
        if (id_organizacion)
            filters.id_organizacion = parseInt(id_organizacion);
        if (id_proyecto)
            filters.id_proyecto = parseInt(id_proyecto);
        return this.service.findAll(Object.keys(filters).length > 0 ? filters : undefined);
    }
    findByOrganization(id) {
        return this.service.findByOrganization(id);
    }
    findByProject(id) {
        return this.service.findByProject(id);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user);
    }
    remove(id, user) {
        return this.service.remove(id, user);
    }
    getPermisos(id) {
        return this.service.getPermisos(id);
    }
    updatePermisos(id, body, user) {
        return this.service.updatePermisos(id, body.permisos || [], user);
    }
};
exports.RolController = RolController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rol_dto_1.CreateRolDto, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'organizacion', 'voluntario'),
    __param(0, (0, common_1.Query)('tipo_rol')),
    __param(1, (0, common_1.Query)('id_organizacion')),
    __param(2, (0, common_1.Query)('id_proyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('organizacion/:id'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion', 'voluntario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "findByOrganization", null);
__decorate([
    (0, common_1.Get)('proyecto/:id'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion', 'voluntario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion', 'voluntario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_rol_dto_1.UpdateRolDto,
        user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/permisos'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "getPermisos", null);
__decorate([
    (0, common_1.Patch)(':id/permisos'),
    (0, roles_decorator_1.Roles)('admin', 'organizacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], RolController.prototype, "updatePermisos", null);
exports.RolController = RolController = __decorate([
    (0, common_1.Controller)('roles'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [rol_service_1.RolService])
], RolController);
//# sourceMappingURL=rol.controller.js.map