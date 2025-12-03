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
exports.LogroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const logro_entity_1 = require("./logro.entity");
let LogroService = class LogroService {
    constructor(logroRepository) {
        this.logroRepository = logroRepository;
    }
    async create(createLogroDto) {
        const logro = this.logroRepository.create(createLogroDto);
        return await this.logroRepository.save(logro);
    }
    async findAll() {
        return await this.logroRepository.find({
            relations: ['voluntarioLogros'],
            order: { creado_en: 'DESC' },
        });
    }
    async findByType(tipo) {
        return await this.logroRepository.find({
            where: { tipo },
            relations: ['voluntarioLogros'],
            order: { creado_en: 'DESC' },
        });
    }
    async findOne(id) {
        const logro = await this.logroRepository.findOne({
            where: { id_logro: id },
            relations: ['voluntarioLogros'],
        });
        if (!logro) {
            throw new common_1.NotFoundException(`Logro con ID ${id} no encontrado`);
        }
        return logro;
    }
    async update(id, updateLogroDto) {
        const logro = await this.findOne(id);
        Object.assign(logro, updateLogroDto);
        return await this.logroRepository.save(logro);
    }
    async remove(id) {
        const logro = await this.findOne(id);
        await this.logroRepository.remove(logro);
    }
};
exports.LogroService = LogroService;
exports.LogroService = LogroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(logro_entity_1.Logro)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogroService);
//# sourceMappingURL=logro.service.js.map