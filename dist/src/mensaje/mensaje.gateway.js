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
exports.MensajeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const mensaje_service_1 = require("./mensaje.service");
const create_mensaje_dto_1 = require("./dto/create-mensaje.dto");
let MensajeGateway = class MensajeGateway {
    constructor(mensajeService, jwtService) {
        this.mensajeService = mensajeService;
        this.jwtService = jwtService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        var _a, _b, _c;
        try {
            const token = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_c = (_b = client.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.replace('Bearer ', ''));
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub || payload.id_usuario;
            if (!userId) {
                client.disconnect();
                return;
            }
            client.userId = userId;
            this.connectedUsers.set(userId, client.id);
            client.broadcast.emit('usuario-online', { userId });
            client.join(`user:${userId}`);
            console.log(`Usuario ${userId} conectado. Socket: ${client.id}`);
        }
        catch (error) {
            console.error('Error en autenticación WebSocket:', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            client.broadcast.emit('usuario-offline', { userId: client.userId });
            console.log(`Usuario ${client.userId} desconectado. Socket: ${client.id}`);
        }
    }
    async handleMensaje(createMensajeDto, client) {
        if (!client.userId) {
            return { error: 'No autenticado' };
        }
        try {
            const mensaje = await this.mensajeService.crearMensaje(createMensajeDto, client.userId);
            const destinatarioSocketId = this.connectedUsers.get(createMensajeDto.id_destinatario);
            if (destinatarioSocketId) {
                this.server.to(destinatarioSocketId).emit('nuevo-mensaje', mensaje);
            }
            client.emit('mensaje-enviado', mensaje);
            this.server.to(`user:${client.userId}`).emit('conversacion-actualizada', {
                id_conversacion: mensaje.id_conversacion,
            });
            this.server.to(`user:${createMensajeDto.id_destinatario}`).emit('conversacion-actualizada', {
                id_conversacion: mensaje.id_conversacion,
            });
            return { success: true, mensaje };
        }
        catch (error) {
            console.error('Error al enviar mensaje:', error);
            return { error: error.message };
        }
    }
    async handleMarcarLeido(data, client) {
        if (!client.userId) {
            return { error: 'No autenticado' };
        }
        try {
            await this.mensajeService.marcarComoLeido(data.id_mensaje, client.userId);
            client.broadcast.emit('mensaje-leido', {
                id_mensaje: data.id_mensaje,
                leido_por: client.userId,
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error al marcar como leído:', error);
            return { error: error.message };
        }
    }
    async handleEscribiendo(data, client) {
        if (!client.userId) {
            return;
        }
        const destinatarioSocketId = this.connectedUsers.get(data.id_destinatario);
        if (destinatarioSocketId) {
            this.server.to(destinatarioSocketId).emit('usuario-escribiendo', {
                id_usuario: client.userId,
                escribiendo: data.escribiendo,
            });
        }
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
};
exports.MensajeGateway = MensajeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MensajeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('enviar-mensaje'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mensaje_dto_1.CreateMensajeDto, Object]),
    __metadata("design:returntype", Promise)
], MensajeGateway.prototype, "handleMensaje", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('marcar-leido'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MensajeGateway.prototype, "handleMarcarLeido", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('escribiendo'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MensajeGateway.prototype, "handleEscribiendo", null);
exports.MensajeGateway = MensajeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
        namespace: '/mensajes',
    }),
    __metadata("design:paramtypes", [mensaje_service_1.MensajeService,
        jwt_1.JwtService])
], MensajeGateway);
//# sourceMappingURL=mensaje.gateway.js.map