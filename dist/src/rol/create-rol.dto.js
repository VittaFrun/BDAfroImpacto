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
exports.CreateRolDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateRolDto {
}
exports.CreateRolDto = CreateRolDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRolDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRolDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['organizacion', 'proyecto']),
    __metadata("design:type", String)
], CreateRolDto.prototype, "tipo_rol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'id_organizacion debe ser un número' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        const parsed = parseInt(value);
        return isNaN(parsed) ? undefined : parsed;
    }),
    __metadata("design:type", Number)
], CreateRolDto.prototype, "id_organizacion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'id_proyecto debe ser un número' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        const parsed = parseInt(value);
        return isNaN(parsed) ? undefined : parsed;
    }),
    __metadata("design:type", Number)
], CreateRolDto.prototype, "id_proyecto", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === 1),
    __metadata("design:type", Boolean)
], CreateRolDto.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value && typeof value === 'string') {
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (hexRegex.test(value)) {
                return value.toUpperCase();
            }
        }
        return value || '#2196F3';
    }),
    __metadata("design:type", String)
], CreateRolDto.prototype, "color", void 0);
//# sourceMappingURL=create-rol.dto.js.map