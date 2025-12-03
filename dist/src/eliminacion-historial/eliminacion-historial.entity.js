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
exports.EliminacionHistorial = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let EliminacionHistorial = class EliminacionHistorial {
};
exports.EliminacionHistorial = EliminacionHistorial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_eliminacion' }),
    __metadata("design:type", Number)
], EliminacionHistorial.prototype, "id_eliminacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], EliminacionHistorial.prototype, "tipo_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_entidad' }),
    __metadata("design:type", Number)
], EliminacionHistorial.prototype, "id_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], EliminacionHistorial.prototype, "nombre_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], EliminacionHistorial.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto', nullable: true }),
    __metadata("design:type", Number)
], EliminacionHistorial.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], EliminacionHistorial.prototype, "proyecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario_eliminador' }),
    __metadata("design:type", Number)
], EliminacionHistorial.prototype, "id_usuario_eliminador", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario_eliminador' }),
    __metadata("design:type", user_entity_1.Usuario)
], EliminacionHistorial.prototype, "usuario_eliminador", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], EliminacionHistorial.prototype, "razon", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], EliminacionHistorial.prototype, "datos_adicionales", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_eliminacion' }),
    __metadata("design:type", Date)
], EliminacionHistorial.prototype, "fecha_eliminacion", void 0);
exports.EliminacionHistorial = EliminacionHistorial = __decorate([
    (0, typeorm_1.Entity)({ name: 'eliminacion_historial' })
], EliminacionHistorial);
//# sourceMappingURL=eliminacion-historial.entity.js.map