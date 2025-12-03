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
exports.Comentario = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const fase_entity_1 = require("../fase/fase.entity");
let Comentario = class Comentario {
};
exports.Comentario = Comentario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_comentario' }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_comentario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario' }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario' }),
    __metadata("design:type", user_entity_1.Usuario)
], Comentario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Comentario.prototype, "contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Comentario.prototype, "tipo_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_entidad' }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_tarea', nullable: true }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_tarea", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tarea_entity_1.Tarea, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_tarea' }),
    __metadata("design:type", tarea_entity_1.Tarea)
], Comentario.prototype, "tarea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto', nullable: true }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], Comentario.prototype, "proyecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_fase', nullable: true }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_fase", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fase_entity_1.Fase, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_fase' }),
    __metadata("design:type", fase_entity_1.Fase)
], Comentario.prototype, "fase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_comentario_padre', nullable: true }),
    __metadata("design:type", Number)
], Comentario.prototype, "id_comentario_padre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comentario, (comentario) => comentario.respuestas, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_comentario_padre' }),
    __metadata("design:type", Comentario)
], Comentario.prototype, "comentario_padre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comentario, (comentario) => comentario.comentario_padre),
    __metadata("design:type", Array)
], Comentario.prototype, "respuestas", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Comentario.prototype, "archivos_adjuntos", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Comentario.prototype, "menciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Comentario.prototype, "editado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_edicion', nullable: true }),
    __metadata("design:type", Date)
], Comentario.prototype, "fecha_edicion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Comentario.prototype, "eliminado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_eliminacion', nullable: true }),
    __metadata("design:type", Date)
], Comentario.prototype, "fecha_eliminacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Comentario.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Comentario.prototype, "actualizado_en", void 0);
exports.Comentario = Comentario = __decorate([
    (0, typeorm_1.Entity)({ name: 'comentario' }),
    (0, typeorm_1.Index)(['tipo_entidad', 'id_entidad']),
    (0, typeorm_1.Index)(['id_usuario', 'creado_en'])
], Comentario);
//# sourceMappingURL=comentario.entity.js.map