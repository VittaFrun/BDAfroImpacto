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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notificacion_entity_1 = require("./notificacion.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const user_entity_1 = require("../users/user.entity");
let NotificacionService = class NotificacionService {
    constructor(repo, orgRepo, volRepo, usuarioRepo) {
        this.repo = repo;
        this.orgRepo = orgRepo;
        this.volRepo = volRepo;
        this.usuarioRepo = usuarioRepo;
    }
    async crear(dto) {
        const notificacion = this.repo.create(Object.assign(Object.assign({}, dto), { tipo: dto.tipo || 'info', leida: false }));
        return this.repo.save(notificacion);
    }
    async crearMultiples(dtos) {
        const notificaciones = dtos.map(dto => this.repo.create(Object.assign(Object.assign({}, dto), { tipo: dto.tipo || 'info', leida: false })));
        return this.repo.save(notificaciones);
    }
    async findByUsuario(id_usuario, soloNoLeidas = false) {
        const where = { id_usuario };
        if (soloNoLeidas) {
            where.leida = false;
        }
        return this.repo.find({
            where,
            relations: ['proyecto'],
            order: { fecha_creacion: 'DESC' },
        });
    }
    async marcarComoLeida(id_notificacion, id_usuario) {
        const notificacion = await this.repo.findOne({
            where: { id_notificacion, id_usuario },
        });
        if (!notificacion) {
            throw new Error('Notificación no encontrada');
        }
        notificacion.leida = true;
        return this.repo.save(notificacion);
    }
    async marcarTodasComoLeidas(id_usuario) {
        await this.repo.update({ id_usuario, leida: false }, { leida: true });
        return { message: 'Todas las notificaciones han sido marcadas como leídas' };
    }
    async eliminar(id_notificacion, id_usuario) {
        return this.repo.delete({ id_notificacion, id_usuario });
    }
    async contarNoLeidas(id_usuario) {
        return this.repo.count({
            where: { id_usuario, leida: false },
        });
    }
    async notificarCambioEstadoProyecto(id_proyecto, id_organizacion, estadoAnterior, estadoNuevo, nombreProyecto) {
        const organizacion = await this.orgRepo.findOne({
            where: { id_organizacion },
            relations: ['usuario']
        });
        if (organizacion === null || organizacion === void 0 ? void 0 : organizacion.usuario) {
            return this.crear({
                id_usuario: organizacion.usuario.id_usuario,
                titulo: 'Estado del Proyecto Actualizado',
                mensaje: `El estado del proyecto "${nombreProyecto}" ha cambiado de "${estadoAnterior}" a "${estadoNuevo}"`,
                tipo: 'info',
                id_proyecto,
                tipo_entidad: 'proyecto',
                id_entidad: id_proyecto,
                datos_adicionales: {
                    estado_anterior: estadoAnterior,
                    estado_nuevo: estadoNuevo
                }
            });
        }
    }
    async notificarNuevaAsignacion(id_voluntario, id_proyecto, id_tarea, nombreTarea, nombreProyecto, nombreRol) {
        const voluntario = await this.volRepo.findOne({
            where: { id_voluntario },
            relations: ['usuario']
        });
        if (voluntario === null || voluntario === void 0 ? void 0 : voluntario.usuario) {
            return this.crear({
                id_usuario: voluntario.usuario.id_usuario,
                titulo: 'Nueva Asignación',
                mensaje: `Has sido asignado a la tarea "${nombreTarea}" en el proyecto "${nombreProyecto}" con el rol "${nombreRol}"`,
                tipo: 'info',
                id_proyecto,
                tipo_entidad: 'asignacion',
                id_entidad: id_tarea,
                datos_adicionales: {
                    id_tarea,
                    nombre_rol: nombreRol
                }
            });
        }
    }
    async notificarNuevoComentario(id_usuario_comentario, id_tarea, id_proyecto, nombreTarea, nombreAutor, esMencion = false) {
        const { Asignacion } = await Promise.resolve().then(() => require('../asignacion/asignacion.entity'));
        const { Comentario } = await Promise.resolve().then(() => require('../comentario/comentario.entity'));
        const { getRepository } = await Promise.resolve().then(() => require('typeorm'));
        const asignacionRepo = getRepository(Asignacion);
        const comentarioRepo = getRepository(Comentario);
        const asignaciones = await asignacionRepo.find({
            where: { id_tarea },
            relations: ['voluntario', 'voluntario.usuario']
        });
        const comentarios = await comentarioRepo.find({
            where: { id_tarea },
            relations: ['usuario']
        });
        const usuariosNotificar = new Set();
        asignaciones.forEach(a => {
            var _a, _b;
            if (((_b = (_a = a.voluntario) === null || _a === void 0 ? void 0 : _a.usuario) === null || _b === void 0 ? void 0 : _b.id_usuario) && a.voluntario.usuario.id_usuario !== id_usuario_comentario) {
                usuariosNotificar.add(a.voluntario.usuario.id_usuario);
            }
        });
        comentarios.forEach(c => {
            if (c.id_usuario && c.id_usuario !== id_usuario_comentario) {
                usuariosNotificar.add(c.id_usuario);
            }
        });
        const notificaciones = Array.from(usuariosNotificar).map(id_usuario => ({
            id_usuario,
            titulo: esMencion ? 'Has sido mencionado' : 'Nuevo Comentario',
            mensaje: esMencion
                ? `${nombreAutor} te ha mencionado en un comentario de la tarea "${nombreTarea}"`
                : `${nombreAutor} ha comentado en la tarea "${nombreTarea}"`,
            tipo: esMencion ? 'warning' : 'info',
            id_proyecto,
            tipo_entidad: 'comentario',
            id_entidad: id_tarea,
            datos_adicionales: {
                id_tarea,
                nombre_tarea: nombreTarea
            }
        }));
        if (notificaciones.length > 0) {
            return this.crearMultiples(notificaciones);
        }
    }
    async notificarTareaProximaVencer(id_voluntario, id_proyecto, id_tarea, nombreTarea, fechaFin, diasRestantes) {
        const voluntario = await this.volRepo.findOne({
            where: { id_voluntario },
            relations: ['usuario']
        });
        if (voluntario === null || voluntario === void 0 ? void 0 : voluntario.usuario) {
            return this.crear({
                id_usuario: voluntario.usuario.id_usuario,
                titulo: 'Tarea Próxima a Vencer',
                mensaje: `La tarea "${nombreTarea}" vence en ${diasRestantes} día(s). Fecha límite: ${fechaFin.toLocaleDateString()}`,
                tipo: diasRestantes <= 1 ? 'error' : 'warning',
                id_proyecto,
                tipo_entidad: 'tarea',
                id_entidad: id_tarea,
                datos_adicionales: {
                    id_tarea,
                    fecha_fin: fechaFin,
                    dias_restantes: diasRestantes
                }
            });
        }
    }
    async notificarTareaPendiente(id_voluntario, id_proyecto, id_tarea, nombreTarea, diasSinActividad) {
        const voluntario = await this.volRepo.findOne({
            where: { id_voluntario },
            relations: ['usuario']
        });
        if (voluntario === null || voluntario === void 0 ? void 0 : voluntario.usuario) {
            return this.crear({
                id_usuario: voluntario.usuario.id_usuario,
                titulo: 'Recordatorio de Tarea',
                mensaje: `La tarea "${nombreTarea}" está pendiente desde hace ${diasSinActividad} día(s). ¿Necesitas ayuda?`,
                tipo: 'info',
                id_proyecto,
                tipo_entidad: 'tarea',
                id_entidad: id_tarea,
                datos_adicionales: {
                    id_tarea,
                    dias_sin_actividad: diasSinActividad
                }
            });
        }
    }
};
exports.NotificacionService = NotificacionService;
exports.NotificacionService = NotificacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notificacion_entity_1.Notificacion)),
    __param(1, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificacionService);
//# sourceMappingURL=notificacion.service.js.map