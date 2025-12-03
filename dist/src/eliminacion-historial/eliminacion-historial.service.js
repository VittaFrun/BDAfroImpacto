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
exports.EliminacionHistorialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const eliminacion_historial_entity_1 = require("./eliminacion-historial.entity");
let EliminacionHistorialService = class EliminacionHistorialService {
    constructor(repo) {
        this.repo = repo;
    }
    async registrarEliminacion(dto, usuario) {
        const registro = this.repo.create(Object.assign(Object.assign({}, dto), { id_usuario_eliminador: usuario.id_usuario }));
        return this.repo.save(registro);
    }
    async findByProyecto(id_proyecto) {
        return this.repo.find({
            where: { id_proyecto },
            relations: ['usuario_eliminador', 'proyecto'],
            order: { fecha_eliminacion: 'DESC' },
        });
    }
    async findByUsuario(id_usuario) {
        return this.repo.find({
            where: { id_usuario_eliminador: id_usuario },
            relations: ['usuario_eliminador', 'proyecto'],
            order: { fecha_eliminacion: 'DESC' },
        });
    }
    async findByTipoEntidad(tipo_entidad, id_proyecto) {
        const where = { tipo_entidad };
        if (id_proyecto) {
            where.id_proyecto = id_proyecto;
        }
        return this.repo.find({
            where,
            relations: ['usuario_eliminador', 'proyecto'],
            order: { fecha_eliminacion: 'DESC' },
        });
    }
    async findRecent(id_proyecto) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        const where = {
            fecha_eliminacion: { $gte: fechaLimite },
        };
        if (id_proyecto) {
            where.id_proyecto = id_proyecto;
        }
        return this.repo
            .createQueryBuilder('eliminacion')
            .where('eliminacion.fecha_eliminacion >= :fechaLimite', { fechaLimite })
            .andWhere(id_proyecto ? 'eliminacion.id_proyecto = :id_proyecto' : '1=1', { id_proyecto })
            .leftJoinAndSelect('eliminacion.usuario_eliminador', 'usuario')
            .leftJoinAndSelect('eliminacion.proyecto', 'proyecto')
            .orderBy('eliminacion.fecha_eliminacion', 'DESC')
            .getMany();
    }
};
exports.EliminacionHistorialService = EliminacionHistorialService;
exports.EliminacionHistorialService = EliminacionHistorialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(eliminacion_historial_entity_1.EliminacionHistorial)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EliminacionHistorialService);
//# sourceMappingURL=eliminacion-historial.service.js.map