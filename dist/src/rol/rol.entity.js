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
exports.Rol = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const permiso_entity_1 = require("../permiso/permiso.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
let Rol = class Rol {
};
exports.Rol = Rol;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_rol' }),
    __metadata("design:type", Number)
], Rol.prototype, "id_rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Rol.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Rol.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['organizacion', 'proyecto'],
        name: 'tipo_rol',
        default: 'organizacion'
    }),
    __metadata("design:type", String)
], Rol.prototype, "tipo_rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_organizacion', nullable: true }),
    __metadata("design:type", Number)
], Rol.prototype, "id_organizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organizacion_entity_1.Organizacion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_organizacion' }),
    __metadata("design:type", organizacion_entity_1.Organizacion)
], Rol.prototype, "organizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_proyecto', nullable: true }),
    __metadata("design:type", Number)
], Rol.prototype, "id_proyecto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proyecto_entity_1.Proyecto, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'id_proyecto' }),
    __metadata("design:type", proyecto_entity_1.Proyecto)
], Rol.prototype, "proyecto", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Rol.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 7, default: '#2196F3', nullable: true }),
    __metadata("design:type", String)
], Rol.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creado_por', nullable: true }),
    __metadata("design:type", Number)
], Rol.prototype, "creado_por", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'creado_por' }),
    __metadata("design:type", user_entity_1.Usuario)
], Rol.prototype, "creador", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], Rol.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'actualizado_en' }),
    __metadata("design:type", Date)
], Rol.prototype, "actualizado_en", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.Usuario, (usuario) => usuario.rol),
    __metadata("design:type", Array)
], Rol.prototype, "usuarios", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => permiso_entity_1.Permiso, (permiso) => permiso.roles),
    (0, typeorm_1.JoinTable)({
        name: 'rol_permiso',
        joinColumn: { name: 'id_rol' },
        inverseJoinColumn: { name: 'id_permiso' },
    }),
    __metadata("design:type", Array)
], Rol.prototype, "permisos", void 0);
exports.Rol = Rol = __decorate([
    (0, typeorm_1.Entity)({ name: 'rol' })
], Rol);
//# sourceMappingURL=rol.entity.js.map