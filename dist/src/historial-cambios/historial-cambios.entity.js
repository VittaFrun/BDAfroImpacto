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
exports.HistorialCambios = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
let HistorialCambios = class HistorialCambios {
};
exports.HistorialCambios = HistorialCambios;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_historial' }),
    __metadata("design:type", Number)
], HistorialCambios.prototype, "id_historial", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['proyecto', 'tarea', 'fase', 'voluntario', 'organizacion', 'asignacion', 'horas'],
        name: 'tipo_entidad'
    }),
    __metadata("design:type", String)
], HistorialCambios.prototype, "tipo_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_entidad' }),
    __metadata("design:type", Number)
], HistorialCambios.prototype, "id_entidad", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['crear', 'actualizar', 'eliminar', 'restaurar'],
        default: 'actualizar'
    }),
    __metadata("design:type", String)
], HistorialCambios.prototype, "accion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, name: 'datos_anteriores' }),
    __metadata("design:type", Object)
], HistorialCambios.prototype, "datos_anteriores", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, name: 'datos_nuevos' }),
    __metadata("design:type", Object)
], HistorialCambios.prototype, "datos_nuevos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, name: 'campos_modificados' }),
    __metadata("design:type", Array)
], HistorialCambios.prototype, "campos_modificados", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], HistorialCambios.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 45, nullable: true, name: 'direccion_ip' }),
    __metadata("design:type", String)
], HistorialCambios.prototype, "direccion_ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true, name: 'user_agent' }),
    __metadata("design:type", String)
], HistorialCambios.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_usuario' }),
    __metadata("design:type", Number)
], HistorialCambios.prototype, "id_usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'creado_en' }),
    __metadata("design:type", Date)
], HistorialCambios.prototype, "creado_en", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario' }),
    __metadata("design:type", user_entity_1.Usuario)
], HistorialCambios.prototype, "usuario", void 0);
exports.HistorialCambios = HistorialCambios = __decorate([
    (0, typeorm_1.Entity)('historial_cambios')
], HistorialCambios);
//# sourceMappingURL=historial-cambios.entity.js.map