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
exports.Tarea = void 0;
const typeorm_1 = require("typeorm");
const estado_entity_1 = require("../estado/estado.entity");
const fase_entity_1 = require("../fase/fase.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const movimiento_entity_1 = require("../movimiento/movimiento.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
let Tarea = class Tarea {
};
exports.Tarea = Tarea;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_tarea' }),
    __metadata("design:type", Number)
], Tarea.prototype, "id_tarea", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Tarea.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { name: 'fecha_inicio', nullable: true }),
    __metadata("design:type", Date)
], Tarea.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { name: 'fecha_fin', nullable: true }),
    __metadata("design:type", Date)
], Tarea.prototype, "fecha_fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['Alta', 'Media', 'Baja'], nullable: true }),
    __metadata("design:type", String)
], Tarea.prototype, "prioridad", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Tarea.prototype, "complejidad", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Tarea.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_estado', nullable: true }),
    __metadata("design:type", Number)
], Tarea.prototype, "id_estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => estado_entity_1.Estado, (estado) => estado.tareas),
    (0, typeorm_1.JoinColumn)({ name: 'id_estado' }),
    __metadata("design:type", estado_entity_1.Estado)
], Tarea.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_fase', nullable: true }),
    __metadata("design:type", Number)
], Tarea.prototype, "id_fase", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fase_entity_1.Fase, (fase) => fase.tareas),
    (0, typeorm_1.JoinColumn)({ name: 'id_fase' }),
    __metadata("design:type", fase_entity_1.Fase)
], Tarea.prototype, "fase", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Tarea.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Tarea.prototype, "actualizado_en", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asignacion_entity_1.Asignacion, (asignacion) => asignacion.tarea),
    __metadata("design:type", Array)
], Tarea.prototype, "asignaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movimiento_entity_1.Movimiento, (movimiento) => movimiento.tarea),
    __metadata("design:type", Array)
], Tarea.prototype, "movimientos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => horas_voluntariadas_entity_1.HorasVoluntariadas, (horasVoluntariadas) => horasVoluntariadas.tarea),
    __metadata("design:type", Array)
], Tarea.prototype, "horasVoluntariadas", void 0);
exports.Tarea = Tarea = __decorate([
    (0, typeorm_1.Entity)({ name: 'tarea' })
], Tarea);
//# sourceMappingURL=tarea.entity.js.map