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
exports.MensajeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const user_entity_1 = require("../users/user.entity");
const mensaje_service_1 = require("./mensaje.service");
const create_mensaje_dto_1 = require("./dto/create-mensaje.dto");
let MensajeController = class MensajeController {
    constructor(mensajeService) {
        this.mensajeService = mensajeService;
    }
    async crearMensaje(createMensajeDto, user) {
        return this.mensajeService.crearMensaje(createMensajeDto, user.id_usuario);
    }
    async obtenerConversaciones(user) {
        return this.mensajeService.obtenerConversaciones(user.id_usuario);
    }
    async obtenerMensajes(idConversacion, user, limit, before) {
        const beforeDate = before ? new Date(before) : undefined;
        return this.mensajeService.obtenerMensajes(idConversacion, user.id_usuario, limit ? parseInt(limit.toString()) : 50, beforeDate);
    }
    async marcarComoLeido(id, user) {
        await this.mensajeService.marcarComoLeido(id, user.id_usuario);
        return { success: true };
    }
    async eliminarMensaje(id, user) {
        await this.mensajeService.eliminarMensaje(id, user.id_usuario);
        return { success: true };
    }
    async contarNoLeidos(user) {
        const count = await this.mensajeService.contarMensajesNoLeidos(user.id_usuario);
        return { count };
    }
};
exports.MensajeController = MensajeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mensaje_dto_1.CreateMensajeDto,
        user_entity_1.Usuario]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "crearMensaje", null);
__decorate([
    (0, common_1.Get)('conversaciones'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "obtenerConversaciones", null);
__decorate([
    (0, common_1.Get)('conversaciones/:idConversacion'),
    __param(0, (0, common_1.Param)('idConversacion', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario, Number, String]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "obtenerMensajes", null);
__decorate([
    (0, common_1.Patch)(':id/leido'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "marcarComoLeido", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.Usuario]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "eliminarMensaje", null);
__decorate([
    (0, common_1.Get)('no-leidos/contar'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.Usuario]),
    __metadata("design:returntype", Promise)
], MensajeController.prototype, "contarNoLeidos", null);
exports.MensajeController = MensajeController = __decorate([
    (0, common_1.Controller)('mensajes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mensaje_service_1.MensajeService])
], MensajeController);
//# sourceMappingURL=mensaje.controller.js.map