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
exports.MensajeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mensaje_entity_1 = require("./mensaje.entity");
const conversacion_entity_1 = require("./conversacion.entity");
let MensajeService = class MensajeService {
    constructor(mensajeRepository, conversacionRepository) {
        this.mensajeRepository = mensajeRepository;
        this.conversacionRepository = conversacionRepository;
    }
    async crearMensaje(createMensajeDto, idRemitente) {
        if (createMensajeDto.id_destinatario === idRemitente) {
            throw new common_1.ForbiddenException('No puedes enviarte mensajes a ti mismo');
        }
        let conversacion = await this.conversacionRepository.findOne({
            where: [
                { id_usuario1: idRemitente, id_usuario2: createMensajeDto.id_destinatario },
                { id_usuario1: createMensajeDto.id_destinatario, id_usuario2: idRemitente },
            ],
        });
        if (!conversacion) {
            conversacion = this.conversacionRepository.create({
                id_usuario1: idRemitente,
                id_usuario2: createMensajeDto.id_destinatario,
                mensajes_no_leidos_usuario2: 0,
            });
            conversacion = await this.conversacionRepository.save(conversacion);
        }
        const mensaje = this.mensajeRepository.create({
            id_conversacion: conversacion.id_conversacion,
            id_remitente: idRemitente,
            id_destinatario: createMensajeDto.id_destinatario,
            contenido: createMensajeDto.contenido,
            tipo: createMensajeDto.tipo || 'texto',
            archivo_url: createMensajeDto.archivo_url,
            archivo_nombre: createMensajeDto.archivo_nombre,
            archivo_tipo: createMensajeDto.archivo_tipo,
            archivo_tamaño: createMensajeDto.archivo_tamaño,
            leido: false,
        });
        const mensajeGuardado = await this.mensajeRepository.save(mensaje);
        conversacion.ultimo_mensaje = createMensajeDto.contenido.substring(0, 100);
        conversacion.fecha_ultimo_mensaje = new Date();
        if (conversacion.id_usuario1 === idRemitente) {
            conversacion.mensajes_no_leidos_usuario2 += 1;
        }
        else {
            conversacion.mensajes_no_leidos_usuario1 += 1;
        }
        await this.conversacionRepository.save(conversacion);
        return mensajeGuardado;
    }
    async obtenerConversaciones(idUsuario) {
        const conversaciones = await this.conversacionRepository.find({
            where: [
                { id_usuario1: idUsuario },
                { id_usuario2: idUsuario },
            ],
            relations: ['usuario1', 'usuario2'],
            order: { fecha_ultimo_mensaje: 'DESC' },
        });
        return conversaciones.map(conv => {
            const otroUsuario = conv.id_usuario1 === idUsuario ? conv.usuario2 : conv.usuario1;
            const mensajesNoLeidos = conv.id_usuario1 === idUsuario
                ? conv.mensajes_no_leidos_usuario1
                : conv.mensajes_no_leidos_usuario2;
            const archivada = conv.id_usuario1 === idUsuario
                ? conv.archivada_usuario1
                : conv.archivada_usuario2;
            return Object.assign(Object.assign({}, conv), { otro_usuario: otroUsuario, mensajes_no_leidos: mensajesNoLeidos, archivada });
        });
    }
    async obtenerMensajes(idConversacion, idUsuario, limit = 50, before) {
        const conversacion = await this.conversacionRepository.findOne({
            where: [
                { id_conversacion: idConversacion, id_usuario1: idUsuario },
                { id_conversacion: idConversacion, id_usuario2: idUsuario },
            ],
        });
        if (!conversacion) {
            throw new common_1.NotFoundException('Conversación no encontrada');
        }
        const queryBuilder = this.mensajeRepository
            .createQueryBuilder('mensaje')
            .where('mensaje.id_conversacion = :idConversacion', { idConversacion })
            .andWhere('(mensaje.eliminado_remitente = false AND mensaje.id_remitente = :idUsuario) OR ' +
            '(mensaje.eliminado_destinatario = false AND mensaje.id_destinatario = :idUsuario)', { idUsuario })
            .orderBy('mensaje.creado_en', 'DESC')
            .limit(limit);
        if (before) {
            queryBuilder.andWhere('mensaje.creado_en < :before', { before });
        }
        const mensajes = await queryBuilder.getMany();
        const mensajesNoLeidos = mensajes.filter(m => !m.leido && m.id_destinatario === idUsuario);
        if (mensajesNoLeidos.length > 0) {
            await this.mensajeRepository.update({ id_mensaje: (0, typeorm_2.In)(mensajesNoLeidos.map(m => m.id_mensaje)) }, { leido: true, fecha_leido: new Date() });
            if (conversacion.id_usuario1 === idUsuario) {
                conversacion.mensajes_no_leidos_usuario1 = 0;
            }
            else {
                conversacion.mensajes_no_leidos_usuario2 = 0;
            }
            await this.conversacionRepository.save(conversacion);
        }
        return mensajes.reverse();
    }
    async marcarComoLeido(idMensaje, idUsuario) {
        const mensaje = await this.mensajeRepository.findOne({
            where: { id_mensaje: idMensaje, id_destinatario: idUsuario },
        });
        if (!mensaje) {
            throw new common_1.NotFoundException('Mensaje no encontrado');
        }
        if (!mensaje.leido) {
            mensaje.leido = true;
            mensaje.fecha_leido = new Date();
            await this.mensajeRepository.save(mensaje);
            const conversacion = await this.conversacionRepository.findOne({
                where: { id_conversacion: mensaje.id_conversacion },
            });
            if (conversacion) {
                if (conversacion.id_usuario1 === idUsuario) {
                    conversacion.mensajes_no_leidos_usuario1 = Math.max(0, conversacion.mensajes_no_leidos_usuario1 - 1);
                }
                else {
                    conversacion.mensajes_no_leidos_usuario2 = Math.max(0, conversacion.mensajes_no_leidos_usuario2 - 1);
                }
                await this.conversacionRepository.save(conversacion);
            }
        }
    }
    async eliminarMensaje(idMensaje, idUsuario) {
        const mensaje = await this.mensajeRepository.findOne({
            where: { id_mensaje: idMensaje },
        });
        if (!mensaje) {
            throw new common_1.NotFoundException('Mensaje no encontrado');
        }
        if (mensaje.id_remitente === idUsuario) {
            mensaje.eliminado_remitente = true;
        }
        else if (mensaje.id_destinatario === idUsuario) {
            mensaje.eliminado_destinatario = true;
        }
        else {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este mensaje');
        }
        await this.mensajeRepository.save(mensaje);
    }
    async contarMensajesNoLeidos(idUsuario) {
        const conversaciones = await this.conversacionRepository.find({
            where: [
                { id_usuario1: idUsuario },
                { id_usuario2: idUsuario },
            ],
        });
        return conversaciones.reduce((total, conv) => {
            return total + (conv.id_usuario1 === idUsuario
                ? conv.mensajes_no_leidos_usuario1
                : conv.mensajes_no_leidos_usuario2);
        }, 0);
    }
};
exports.MensajeService = MensajeService;
exports.MensajeService = MensajeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mensaje_entity_1.Mensaje)),
    __param(1, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MensajeService);
//# sourceMappingURL=mensaje.service.js.map