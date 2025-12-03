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
exports.CreateProyectoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateProyectoDto {
}
exports.CreateProyectoDto = CreateProyectoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(10, 1000, { message: 'El objetivo debe tener entre 10 y 1000 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "objetivo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100, { message: 'La ubicación debe tener entre 3 y 100 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "ubicacion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de inicio debe ser una fecha válida' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "fecha_inicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de fin debe ser una fecha válida' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "fecha_fin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 255, { message: 'La imagen principal no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "imagen_principal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 255, { message: 'El banner no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "banner", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 255, { message: 'El documento no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "documento", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El presupuesto total debe ser un número válido' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0, { message: 'El presupuesto total no puede ser negativo' }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], CreateProyectoDto.prototype, "presupuesto_total", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del estado debe ser un número válido' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseInt(value) : 1),
    __metadata("design:type", Number)
], CreateProyectoDto.prototype, "id_estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === 1),
    __metadata("design:type", Boolean)
], CreateProyectoDto.prototype, "es_publico", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 50, { message: 'La categoría no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProyectoDto.prototype, "requisitos", void 0);
//# sourceMappingURL=create-proyecto.dto.js.map