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
exports.ProyectoController = void 0;
const common_1 = require("@nestjs/common");
const proyecto_service_1 = require("./proyecto.service");
const create_proyecto_dto_1 = require("./create-proyecto.dto");
const update_proyecto_dto_1 = require("./update-proyecto.dto");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
const create_fase_dto_1 = require("../fase/create-fase.dto");
const create_tarea_dto_1 = require("../tarea/create-tarea.dto");
let ProyectoController = class ProyectoController {
    constructor(service) {
        this.service = service;
    }
    findPublicProjects() {
        return this.service.findPublicProjects();
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    findAll(user) {
        return this.service.findAll(user);
    }
    findOne(id, user) {
        if (user && user.tipo_usuario === 'voluntario') {
            return this.service.findOneForVolunteer(+id, user.id_usuario);
        }
        return this.service.findOne(+id);
    }
    update(id, dto, user) {
        return this.service.update(+id, dto, user);
    }
    remove(id, user) {
        return this.service.remove(+id, user);
    }
    getPhases(id) {
        return this.service.findOne(+id);
    }
    addPhase(id, dto, user) {
        return this.service.addFase(+id, dto, user);
    }
    updatePhase(id, phaseId, dto, user) {
        return this.service.updateFase(+id, +phaseId, dto, user);
    }
    reorderPhases(id, body, user) {
        return this.service.reorderFases(+id, body.ordenes, user);
    }
    removePhase(id, phaseId, user) {
        return this.service.removeFase(+id, +phaseId, user);
    }
    getTasks(id) {
        return this.service.findOne(+id);
    }
    addTask(id, dto, user) {
        return this.service.addTarea(+id, dto, user);
    }
    updateTask(id, taskId, dto, user) {
        return this.service.updateTarea(+id, +taskId, dto, user);
    }
    removeTask(id, taskId, user) {
        return this.service.removeTarea(+id, +taskId, user);
    }
};
exports.ProyectoController = ProyectoController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "findPublicProjects", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_proyecto_dto_1.CreateProyectoDto, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_proyecto_dto_1.UpdateProyectoDto, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/phases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "getPhases", null);
__decorate([
    (0, common_1.Post)(':id/phases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_fase_dto_1.CreateFaseDto, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "addPhase", null);
__decorate([
    (0, common_1.Put)(':id/phases/:phaseId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('phaseId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "updatePhase", null);
__decorate([
    (0, common_1.Put)(':id/phases/reorder'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "reorderPhases", null);
__decorate([
    (0, common_1.Delete)(':id/phases/:phaseId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('phaseId')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "removePhase", null);
__decorate([
    (0, common_1.Get)(':id/tasks'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'voluntario', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)(':id/tasks'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_tarea_dto_1.CreateTareaDto, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "addTask", null);
__decorate([
    (0, common_1.Put)(':id/tasks/:taskId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)(':id/tasks/:taskId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.Usuario]),
    __metadata("design:returntype", void 0)
], ProyectoController.prototype, "removeTask", null);
exports.ProyectoController = ProyectoController = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [proyecto_service_1.ProyectoService])
], ProyectoController);
//# sourceMappingURL=proyecto.controller.js.map