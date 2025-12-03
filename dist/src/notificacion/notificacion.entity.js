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
exports.Notificacion = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let Notificacion = class Notificacion {
};
exports.Notificacion = Notificacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_notificacion' }),
    __metadata("design:type", Number)
], Notificacion.prototype, "id_notificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario' }),
    __metadata("design:type", Number)
], Notificacion.prototype, "id_usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario' }),
    __metadata("design:type", user_entity_1.Usuario)
], Notificacion.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Notificacion.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Notificacion.prototype, "mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'info' }),
    __metadata("design:type", String)
], Notificacion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Notificacion.prototype, "leida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto', nullable: true }),
    __metadata("design:type", Number)
], Notificacion.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], Notificacion.prototype, "proyecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Notificacion.prototype, "tipo_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_entidad', nullable: true }),
    __metadata("design:type", Number)
], Notificacion.prototype, "id_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Notificacion.prototype, "datos_adicionales", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_creacion' }),
    __metadata("design:type", Date)
], Notificacion.prototype, "fecha_creacion", void 0);
exports.Notificacion = Notificacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'notificacion' })
], Notificacion);
//# sourceMappingURL=notificacion.entity.js.map