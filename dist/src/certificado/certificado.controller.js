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
exports.CertificadoController = void 0;
const common_1 = require("@nestjs/common");
const certificado_service_1 = require("./certificado.service");
const create_certificado_dto_1 = require("./create-certificado.dto");
const update_certificado_dto_1 = require("./update-certificado.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let CertificadoController = class CertificadoController {
    constructor(certificadoService) {
        this.certificadoService = certificadoService;
    }
    create(createCertificadoDto, user) {
        return this.certificadoService.create(createCertificadoDto, user.id_usuario);
    }
    findAll(idVoluntario, idProyecto) {
        if (idVoluntario) {
            return this.certificadoService.findByVolunteer(idVoluntario);
        }
        if (idProyecto) {
            return this.certificadoService.findByProject(idProyecto);
        }
        return this.certificadoService.findAll();
    }
    findByVerificationCode(codigo) {
        return this.certificadoService.findByVerificationCode(codigo);
    }
    findOne(id) {
        return this.certificadoService.findOne(+id);
    }
    update(id, updateCertificadoDto) {
        return this.certificadoService.update(+id, updateCertificadoDto);
    }
    remove(id) {
        return this.certificadoService.remove(+id);
    }
};
exports.CertificadoController = CertificadoController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_certificado_dto_1.CreateCertificadoDto, Object]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('voluntario')),
    __param(1, (0, common_1.Query)('proyecto')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('verificar/:codigo'),
    __param(0, (0, common_1.Param)('codigo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "findByVerificationCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_certificado_dto_1.UpdateCertificadoDto]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('organizacion', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificadoController.prototype, "remove", null);
exports.CertificadoController = CertificadoController = __decorate([
    (0, common_1.Controller)('certificado'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [certificado_service_1.CertificadoService])
], CertificadoController);
//# sourceMappingURL=certificado.controller.js.map