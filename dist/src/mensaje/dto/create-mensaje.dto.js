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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMensajeDto = exports.TipoMensaje = void 0;
const class_validator_1 = require("class-validator");
var TipoMensaje;
(function (TipoMensaje) {
    TipoMensaje["TEXTO"] = "texto";
    TipoMensaje["IMAGEN"] = "imagen";
    TipoMensaje["ARCHIVO"] = "archivo";
    TipoMensaje["SISTEMA"] = "sistema";
})(TipoMensaje || (exports.TipoMensaje = TipoMensaje = {}));
class CreateMensajeDto {
}
exports.CreateMensajeDto = CreateMensajeDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMensajeDto.prototype, "id_destinatario", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateMensajeDto.prototype, "contenido", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoMensaje),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMensajeDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMensajeDto.prototype, "archivo_url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMensajeDto.prototype, "archivo_nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMensajeDto.prototype, "archivo_tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMensajeDto.prototype, "archivo_tama\u00F1o", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMensajeDto.prototype, "id_conversacion", void 0);
//# sourceMappingURL=create-mensaje.dto.js.map