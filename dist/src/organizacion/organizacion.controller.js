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
exports.OrganizacionController = void 0;
const common_1 = require("@nestjs/common");
const organizacion_service_1 = require("./organizacion.service");
const create_organizacion_dto_1 = require("./create-organizacion.dto");
const update_organizacion_dto_1 = require("./update-organizacion.dto");
let OrganizacionController = class OrganizacionController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    update(id, dto) {
        return this.service.update(+id, dto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
    findPublicas() {
        return this.service.findPublicas();
    }
    findPublico(id) {
        return this.service.findPublico(id);
    }
    findProyectosPublicos(id) {
        return this.service.findProyectosPublicos(id);
    }
};
exports.OrganizacionController = OrganizacionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organizacion_dto_1.CreateOrganizacionDto]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_organizacion_dto_1.UpdateOrganizacionDto]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('publicas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "findPublicas", null);
__decorate([
    (0, common_1.Get)(':id/publico'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "findPublico", null);
__decorate([
    (0, common_1.Get)(':id/proyectos-publicos'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrganizacionController.prototype, "findProyectosPublicos", null);
exports.OrganizacionController = OrganizacionController = __decorate([
    (0, common_1.Controller)('organizaciones'),
    __metadata("design:paramtypes", [organizacion_service_1.OrganizacionService])
], OrganizacionController);
//# sourceMappingURL=organizacion.controller.js.map