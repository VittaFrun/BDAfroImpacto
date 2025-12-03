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
exports.VoluntarioLogroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const voluntario_logro_entity_1 = require("./voluntario-logro.entity");
let VoluntarioLogroService = class VoluntarioLogroService {
    constructor(voluntarioLogroRepository) {
        this.voluntarioLogroRepository = voluntarioLogroRepository;
    }
    async create(createVoluntarioLogroDto) {
        const voluntarioLogro = this.voluntarioLogroRepository.create(Object.assign(Object.assign({}, createVoluntarioLogroDto), { fecha_obtenido: createVoluntarioLogroDto.fecha_obtenido
                ? new Date(createVoluntarioLogroDto.fecha_obtenido)
                : new Date() }));
        return await this.voluntarioLogroRepository.save(voluntarioLogro);
    }
    async findByVolunteer(idVoluntario) {
        return await this.voluntarioLogroRepository.find({
            where: { id_voluntario: idVoluntario },
            relations: ['logro', 'proyecto'],
            order: { fecha_obtenido: 'DESC' },
        });
    }
    async findByProject(idProyecto) {
        return await this.voluntarioLogroRepository.find({
            where: { proyecto_relacionado: idProyecto },
            relations: ['voluntario', 'voluntario.usuario', 'logro'],
            order: { fecha_obtenido: 'DESC' },
        });
    }
    async findOne(id) {
        const voluntarioLogro = await this.voluntarioLogroRepository.findOne({
            where: { id_voluntario_logro: id },
            relations: ['voluntario', 'voluntario.usuario', 'logro', 'proyecto'],
        });
        if (!voluntarioLogro) {
            throw new common_1.NotFoundException(`Logro de voluntario con ID ${id} no encontrado`);
        }
        return voluntarioLogro;
    }
    async remove(id) {
        const voluntarioLogro = await this.findOne(id);
        await this.voluntarioLogroRepository.remove(voluntarioLogro);
    }
    async getVolunteerPoints(idVoluntario) {
        const logros = await this.findByVolunteer(idVoluntario);
        return logros.reduce((total, vl) => { var _a; return total + (((_a = vl.logro) === null || _a === void 0 ? void 0 : _a.puntos) || 0); }, 0);
    }
};
exports.VoluntarioLogroService = VoluntarioLogroService;
exports.VoluntarioLogroService = VoluntarioLogroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(voluntario_logro_entity_1.VoluntarioLogro)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VoluntarioLogroService);
//# sourceMappingURL=voluntario-logro.service.js.map