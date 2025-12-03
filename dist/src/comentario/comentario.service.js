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
exports.ComentarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comentario_entity_1 = require("./comentario.entity");
const user_entity_1 = require("../users/user.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const proyecto_entity_1 = require("../proyecto/proyecto.entity");
const fase_entity_1 = require("../fase/fase.entity");
const notificacion_service_1 = require("../notificacion/notificacion.service");
let ComentarioService = class ComentarioService {
    constructor(comentarioRepository, tareaRepository, proyectoRepository, faseRepository, usuarioRepository, notificacionService) {
        this.comentarioRepository = comentarioRepository;
        this.tareaRepository = tareaRepository;
        this.proyectoRepository = proyectoRepository;
        this.faseRepository = faseRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionService = notificacionService;
    }
    async create(createComentarioDto, idUsuario) {
        await this.validateEntity(createComentarioDto.tipo_entidad, createComentarioDto.id_entidad);
        if (createComentarioDto.id_comentario_padre) {
            const comentarioPadre = await this.comentarioRepository.findOne({
                where: { id_comentario: createComentarioDto.id_comentario_padre },
            });
            if (!comentarioPadre) {
                throw new common_1.NotFoundException('Comentario padre no encontrado');
            }
        }
        const comentario = this.comentarioRepository.create(Object.assign(Object.assign({}, createComentarioDto), { id_usuario: idUsuario, id_tarea: createComentarioDto.tipo_entidad === 'tarea' ? createComentarioDto.id_entidad : null, id_proyecto: createComentarioDto.tipo_entidad === 'proyecto' ? createComentarioDto.id_entidad : null, id_fase: createComentarioDto.tipo_entidad === 'fase' ? createComentarioDto.id_entidad : null }));
        const comentarioGuardado = await this.comentarioRepository.save(comentario);
        await this.comentarioRepository.findOne({
            where: { id_comentario: comentarioGuardado.id_comentario },
            relations: ['usuario', 'comentario_padre', 'respuestas'],
        });
        if (createComentarioDto.menciones && createComentarioDto.menciones.length > 0) {
            await this.notificarMenciones(createComentarioDto.menciones, comentarioGuardado, idUsuario);
        }
        await this.notificarParticipantes(comentarioGuardado, idUsuario);
        return comentarioGuardado;
    }
    async findAll(tipoEntidad, idEntidad, includeRespuestas = true) {
        const where = {
            tipo_entidad: tipoEntidad,
            id_entidad: idEntidad,
            eliminado: false,
        };
        if (includeRespuestas) {
            where.id_comentario_padre = null;
        }
        return this.comentarioRepository.find({
            where,
            relations: ['usuario', 'comentario_padre', 'respuestas', 'respuestas.usuario'],
            order: { creado_en: 'ASC' },
        });
    }
    async findOne(id) {
        const comentario = await this.comentarioRepository.findOne({
            where: { id_comentario: id },
            relations: ['usuario', 'comentario_padre', 'respuestas', 'respuestas.usuario'],
        });
        if (!comentario) {
            throw new common_1.NotFoundException(`Comentario con ID ${id} no encontrado`);
        }
        return comentario;
    }
    async update(id, updateComentarioDto, idUsuario) {
        const comentario = await this.findOne(id);
        if (comentario.id_usuario !== idUsuario) {
            throw new common_1.ForbiddenException('No tienes permisos para editar este comentario');
        }
        if (comentario.eliminado) {
            throw new common_1.BadRequestException('No se puede editar un comentario eliminado');
        }
        Object.assign(comentario, updateComentarioDto);
        comentario.editado = true;
        comentario.fecha_edicion = new Date();
        if (updateComentarioDto.menciones && updateComentarioDto.menciones.length > 0) {
            await this.notificarMenciones(updateComentarioDto.menciones, comentario, idUsuario);
        }
        return this.comentarioRepository.save(comentario);
    }
    async remove(id, idUsuario) {
        const comentario = await this.findOne(id);
        if (comentario.id_usuario !== idUsuario) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este comentario');
        }
        comentario.eliminado = true;
        comentario.fecha_eliminacion = new Date();
        await this.comentarioRepository.save(comentario);
    }
    async validateEntity(tipoEntidad, idEntidad) {
        let exists = false;
        switch (tipoEntidad) {
            case 'tarea':
                exists = !!(await this.tareaRepository.findOne({ where: { id_tarea: idEntidad } }));
                break;
            case 'proyecto':
                exists = !!(await this.proyectoRepository.findOne({ where: { id_proyecto: idEntidad } }));
                break;
            case 'fase':
                exists = !!(await this.faseRepository.findOne({ where: { id_fase: idEntidad } }));
                break;
            default:
                throw new common_1.BadRequestException(`Tipo de entidad inválido: ${tipoEntidad}`);
        }
        if (!exists) {
            throw new common_1.NotFoundException(`${tipoEntidad} con ID ${idEntidad} no encontrado`);
        }
    }
    async notificarMenciones(mencionados, comentario, idAutor) {
        var _a;
        const autor = await this.usuarioRepository.findOne({ where: { id_usuario: idAutor } });
        const nombreAutor = (autor === null || autor === void 0 ? void 0 : autor.nombre) || 'Un usuario';
        const usuariosMencionados = await this.usuarioRepository.find({
            where: { id_usuario: (0, typeorm_2.In)(mencionados.filter(id => id !== idAutor)) },
        });
        if (comentario.tipo_entidad === 'tarea' && comentario.id_tarea) {
            const tarea = await this.tareaRepository.findOne({
                where: { id_tarea: comentario.id_tarea },
                relations: ['fase', 'fase.proyecto'],
            });
            if (tarea) {
                for (const usuario of usuariosMencionados) {
                    await this.notificacionService.notificarNuevoComentario(idAutor, comentario.id_tarea, ((_a = tarea.fase) === null || _a === void 0 ? void 0 : _a.id_proyecto) || comentario.id_proyecto || null, tarea.descripcion || 'Tarea sin nombre', nombreAutor, true);
                }
            }
            else {
                for (const usuario of usuariosMencionados) {
                    await this.notificacionService.crear({
                        id_usuario: usuario.id_usuario,
                        titulo: 'Has sido mencionado',
                        mensaje: `${nombreAutor} te ha mencionado en un comentario de ${comentario.tipo_entidad}`,
                        tipo: 'warning',
                        id_proyecto: comentario.id_proyecto || null,
                        tipo_entidad: 'comentario',
                        id_entidad: comentario.id_comentario,
                        datos_adicionales: {
                            id_comentario: comentario.id_comentario,
                            id_autor: idAutor,
                        },
                    });
                }
            }
        }
        else {
            for (const usuario of usuariosMencionados) {
                await this.notificacionService.crear({
                    id_usuario: usuario.id_usuario,
                    titulo: 'Has sido mencionado',
                    mensaje: `${nombreAutor} te ha mencionado en un comentario de ${comentario.tipo_entidad}`,
                    tipo: 'warning',
                    id_proyecto: comentario.id_proyecto || null,
                    tipo_entidad: 'comentario',
                    id_entidad: comentario.id_comentario,
                    datos_adicionales: {
                        id_comentario: comentario.id_comentario,
                        id_autor: idAutor,
                    },
                });
            }
        }
    }
    async notificarParticipantes(comentario, idAutor) {
        var _a, _b, _c;
        const autor = await this.usuarioRepository.findOne({ where: { id_usuario: idAutor } });
        const nombreAutor = (autor === null || autor === void 0 ? void 0 : autor.nombre) || 'Un usuario';
        if (comentario.tipo_entidad === 'tarea' && comentario.id_tarea) {
            const tarea = await this.tareaRepository.findOne({
                where: { id_tarea: comentario.id_tarea },
                relations: ['fase', 'fase.proyecto'],
            });
            if (tarea) {
                await this.notificacionService.notificarNuevoComentario(idAutor, comentario.id_tarea, ((_a = tarea.fase) === null || _a === void 0 ? void 0 : _a.id_proyecto) || comentario.id_proyecto || null, tarea.descripcion || 'Tarea sin nombre', nombreAutor, false);
            }
        }
        else if (comentario.tipo_entidad === 'proyecto' && comentario.id_proyecto) {
            const proyecto = await this.proyectoRepository.findOne({
                where: { id_proyecto: comentario.id_proyecto },
                relations: ['organizacion', 'organizacion.usuario'],
            });
            if (((_c = (_b = proyecto === null || proyecto === void 0 ? void 0 : proyecto.organizacion) === null || _b === void 0 ? void 0 : _b.usuario) === null || _c === void 0 ? void 0 : _c.id_usuario) && proyecto.organizacion.usuario.id_usuario !== idAutor) {
                await this.notificacionService.crear({
                    id_usuario: proyecto.organizacion.usuario.id_usuario,
                    titulo: 'Nuevo Comentario',
                    mensaje: `${nombreAutor} ha comentado en el proyecto "${proyecto.nombre}"`,
                    tipo: 'info',
                    id_proyecto: comentario.id_proyecto,
                    tipo_entidad: 'comentario',
                    id_entidad: comentario.id_comentario,
                    datos_adicionales: {
                        id_comentario: comentario.id_comentario,
                        id_autor: idAutor,
                    },
                });
            }
        }
    }
};
exports.ComentarioService = ComentarioService;
exports.ComentarioService = ComentarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comentario_entity_1.Comentario)),
    __param(1, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(2, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(3, (0, typeorm_1.InjectRepository)(fase_entity_1.Fase)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService])
], ComentarioService);
//# sourceMappingURL=comentario.service.js.map