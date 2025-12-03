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
exports.OrganizacionMiembro = void 0;
const typeorm_1 = require("typeorm");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
let OrganizacionMiembro = class OrganizacionMiembro {
};
exports.OrganizacionMiembro = OrganizacionMiembro;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_miembro' }),
    __metadata("design:type", Number)
], OrganizacionMiembro.prototype, "id_miembro", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_organizacion' }),
    __metadata("design:type", Number)
], OrganizacionMiembro.prototype, "id_organizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_1.Organizacion, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id_organizacion' }),
    __metadata("design:type", organizacion_entity_1.Organizacion)
], OrganizacionMiembro.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_voluntario' }),
    __metadata("design:type", Number)
], OrganizacionMiembro.prototype, "id_voluntario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => voluntario_entity_1.Voluntario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id_voluntario' }),
    __metadata("design:type", voluntario_entity_1.Voluntario)
], OrganizacionMiembro.prototype, "voluntario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_rol_organizacion', nullable: true }),
    __metadata("design:type", Number)
], OrganizacionMiembro.prototype, "id_rol_organizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rol_entity_1.Rol, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_rol_organizacion' }),
    __metadata("design:type", rol_entity_1.Rol)
], OrganizacionMiembro.prototype, "rol_organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pendiente', 'activo', 'inactivo'],
        default: 'pendiente'
    }),
    __metadata("design:type", String)
], OrganizacionMiembro.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_solicitud', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], OrganizacionMiembro.prototype, "fecha_solicitud", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_aprobacion', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], OrganizacionMiembro.prototype, "fecha_aprobacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], OrganizacionMiembro.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], OrganizacionMiembro.prototype, "actualizado_en", void 0);
exports.OrganizacionMiembro = OrganizacionMiembro = __decorate([
    (0, typeorm_1.Entity)({ name: 'organizacion_miembro' })
], OrganizacionMiembro);
//# sourceMappingURL=organizacion-miembro.entity.js.map