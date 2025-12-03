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
exports.CreateFaseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateFaseDto {
}
exports.CreateFaseDto = CreateFaseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' }),
    __metadata("design:type", String)
], CreateFaseDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 1000, { message: 'La descripción debe tener entre 1 y 1000 caracteres' }),
    __metadata("design:type", String)
], CreateFaseDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El orden debe ser un número válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1, { message: 'El orden debe ser mayor a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateFaseDto.prototype, "orden", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de inicio debe ser una fecha válida' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFaseDto.prototype, "fecha_inicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de fin debe ser una fecha válida' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFaseDto.prototype, "fecha_fin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del proyecto debe ser un número válido' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseInt(value) : undefined),
    __metadata("design:type", Number)
], CreateFaseDto.prototype, "id_proyecto", void 0);
//# sourceMappingURL=create-fase.dto.js.map