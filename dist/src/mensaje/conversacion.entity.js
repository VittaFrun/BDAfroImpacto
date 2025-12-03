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
exports.Conversacion = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const mensaje_entity_1 = require("./mensaje.entity");
let Conversacion = class Conversacion {
};
exports.Conversacion = Conversacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_conversacion' }),
    __metadata("design:type", Number)
], Conversacion.prototype, "id_conversacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario1' }),
    __metadata("design:type", Number)
], Conversacion.prototype, "id_usuario1", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario1' }),
    __metadata("design:type", user_entity_1.Usuario)
], Conversacion.prototype, "usuario1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario2' }),
    __metadata("design:type", Number)
], Conversacion.prototype, "id_usuario2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario2' }),
    __metadata("design:type", user_entity_1.Usuario)
], Conversacion.prototype, "usuario2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Conversacion.prototype, "ultimo_mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Conversacion.prototype, "fecha_ultimo_mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversacion.prototype, "mensajes_no_leidos_usuario1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversacion.prototype, "mensajes_no_leidos_usuario2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Conversacion.prototype, "archivada_usuario1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Conversacion.prototype, "archivada_usuario2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mensaje_entity_1.Mensaje, (mensaje) => mensaje.id_conversacion),
    __metadata("design:type", Array)
], Conversacion.prototype, "mensajes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Conversacion.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Conversacion.prototype, "actualizado_en", void 0);
exports.Conversacion = Conversacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'conversacion' }),
    (0, typeorm_1.Index)(['id_usuario1', 'id_usuario2'])
], Conversacion);
//# sourceMappingURL=conversacion.entity.js.map