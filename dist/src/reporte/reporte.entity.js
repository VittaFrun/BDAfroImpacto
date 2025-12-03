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
exports.Reporte = void 0;
const typeorm_1 = require("typeorm");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let Reporte = class Reporte {
};
exports.Reporte = Reporte;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_reporte' }),
    __metadata("design:type", Number)
], Reporte.prototype, "id_reporte", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Reporte.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PDF', 'Excel', 'CSV'],
        default: 'PDF'
    }),
    __metadata("design:type", String)
], Reporte.prototype, "formato", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pendiente', 'generando', 'listo', 'error'],
        default: 'pendiente'
    }),
    __metadata("design:type", String)
], Reporte.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto' }),
    __metadata("design:type", Number)
], Reporte.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reporte.prototype, "contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'incluir_graficos' }),
    __metadata("design:type", Boolean)
], Reporte.prototype, "incluir_graficos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Reporte.prototype, "descargas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'fecha_inicio' }),
    __metadata("design:type", Date)
], Reporte.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'fecha_fin' }),
    __metadata("design:type", Date)
], Reporte.prototype, "fecha_fin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Reporte.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Reporte.prototype, "actualizado_en", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], Reporte.prototype, "proyecto", void 0);
exports.Reporte = Reporte = __decorate([
    (0, typeorm_1.Entity)('reporte')
], Reporte);
//# sourceMappingURL=reporte.entity.js.map