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
exports.VoluntarioLogroController = void 0;
const common_1 = require("@nestjs/common");
const voluntario_logro_service_1 = require("./voluntario-logro.service");
const create_voluntario_logro_dto_1 = require("./create-voluntario-logro.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let VoluntarioLogroController = class VoluntarioLogroController {
    constructor(voluntarioLogroService) {
        this.voluntarioLogroService = voluntarioLogroService;
    }
    create(createVoluntarioLogroDto) {
        return this.voluntarioLogroService.create(createVoluntarioLogroDto);
    }
    findAll(idVoluntario, idProyecto) {
        if (idVoluntario) {
            return this.voluntarioLogroService.findByVolunteer(idVoluntario);
        }
        if (idProyecto) {
            return this.voluntarioLogroService.findByProject(idProyecto);
        }
        return [];
    }
    getVolunteerPoints(idVoluntario) {
        return this.voluntarioLogroService.getVolunteerPoints(+idVoluntario);
    }
    findOne(id) {
        return this.voluntarioLogroService.findOne(+id);
    }
    remove(id) {
        return this.voluntarioLogroService.remove(+id);
    }
};
exports.VoluntarioLogroController = VoluntarioLogroController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_voluntario_logro_dto_1.CreateVoluntarioLogroDto]),
    __metadata("design:returntype", void 0)
], VoluntarioLogroController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('voluntario')),
    __param(1, (0, common_1.Query)('proyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], VoluntarioLogroController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('puntos/:idVoluntario'),
    __param(0, (0, common_1.Param)('idVoluntario')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoluntarioLogroController.prototype, "getVolunteerPoints", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoluntarioLogroController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoluntarioLogroController.prototype, "remove", null);
exports.VoluntarioLogroController = VoluntarioLogroController = __decorate([
    (0, common_1.Controller)('voluntario-logro'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [voluntario_logro_service_1.VoluntarioLogroService])
], VoluntarioLogroController);
//# sourceMappingURL=voluntario-logro.controller.js.map