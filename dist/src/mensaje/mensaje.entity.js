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
exports.Mensaje = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
let Mensaje = class Mensaje {
};
exports.Mensaje = Mensaje;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_mensaje' }),
    __metadata("design:type", Number)
], Mensaje.prototype, "id_mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_conversacion', nullable: true }),
    __metadata("design:type", Number)
], Mensaje.prototype, "id_conversacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_remitente' }),
    __metadata("design:type", Number)
], Mensaje.prototype, "id_remitente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_remitente' }),
    __metadata("design:type", user_entity_1.Usuario)
], Mensaje.prototype, "remitente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_destinatario' }),
    __metadata("design:type", Number)
], Mensaje.prototype, "id_destinatario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_destinatario' }),
    __metadata("design:type", user_entity_1.Usuario)
], Mensaje.prototype, "destinatario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Mensaje.prototype, "contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'texto' }),
    __metadata("design:type", String)
], Mensaje.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Mensaje.prototype, "archivo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Mensaje.prototype, "archivo_nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Mensaje.prototype, "archivo_tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Mensaje.prototype, "archivo_tama\u00F1o", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Mensaje.prototype, "leido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Mensaje.prototype, "fecha_leido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Mensaje.prototype, "eliminado_remitente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Mensaje.prototype, "eliminado_destinatario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Mensaje.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Mensaje.prototype, "actualizado_en", void 0);
exports.Mensaje = Mensaje = __decorate([
    (0, typeorm_1.Entity)({ name: 'mensaje' }),
    (0, typeorm_1.Index)(['id_conversacion', 'creado_en']),
    (0, typeorm_1.Index)(['id_remitente', 'creado_en']),
    (0, typeorm_1.Index)(['id_destinatario', 'leido'])
], Mensaje);
//# sourceMappingURL=mensaje.entity.js.map