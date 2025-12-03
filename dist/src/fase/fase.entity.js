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
exports.Fase = void 0;
const typeorm_1 = require("typeorm");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
let Fase = class Fase {
};
exports.Fase = Fase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_fase' }),
    __metadata("design:type", Number)
], Fase.prototype, "id_fase", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Fase.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Fase.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Fase.prototype, "orden", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Fase.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Fase.prototype, "fecha_fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto' }),
    __metadata("design:type", Number)
], Fase.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, (proyecto) => proyecto.fases),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], Fase.prototype, "proyecto", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Fase.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Fase.prototype, "actualizado_en", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tarea_entity_1.Tarea, (tarea) => tarea.fase),
    __metadata("design:type", Array)
], Fase.prototype, "tareas", void 0);
exports.Fase = Fase = __decorate([
    (0, typeorm_1.Entity)({ name: 'fase' })
], Fase);
//# sourceMappingURL=fase.entity.js.map