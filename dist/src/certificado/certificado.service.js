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
exports.CertificadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const certificado_entity_1 = require("./certificado.entity");
let CertificadoService = class CertificadoService {
    constructor(certificadoRepository) {
        this.certificadoRepository = certificadoRepository;
    }
    async create(createCertificadoDto, userId) {
        const codigo_verificacion = this.generateVerificationCode();
        const certificado = this.certificadoRepository.create(Object.assign(Object.assign({}, createCertificadoDto), { codigo_verificacion, fecha_emision: new Date(createCertificadoDto.fecha_emision), fecha_expiracion: createCertificadoDto.fecha_expiracion
                ? new Date(createCertificadoDto.fecha_expiracion)
                : null }));
        return await this.certificadoRepository.save(certificado);
    }
    async findAll() {
        return await this.certificadoRepository.find({
            relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
            order: { fecha_emision: 'DESC' },
        });
    }
    async findByVolunteer(idVoluntario) {
        return await this.certificadoRepository.find({
            where: { id_voluntario: idVoluntario },
            relations: ['proyecto'],
            order: { fecha_emision: 'DESC' },
        });
    }
    async findByProject(idProyecto) {
        return await this.certificadoRepository.find({
            where: { id_proyecto: idProyecto },
            relations: ['voluntario', 'voluntario.usuario'],
            order: { fecha_emision: 'DESC' },
        });
    }
    async findOne(id) {
        const certificado = await this.certificadoRepository.findOne({
            where: { id_certificado: id },
            relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
        });
        if (!certificado) {
            throw new common_1.NotFoundException(`Certificado con ID ${id} no encontrado`);
        }
        return certificado;
    }
    async findByVerificationCode(codigo) {
        const certificado = await this.certificadoRepository.findOne({
            where: { codigo_verificacion: codigo },
            relations: ['voluntario', 'voluntario.usuario', 'proyecto'],
        });
        if (!certificado) {
            throw new common_1.NotFoundException(`Certificado con código ${codigo} no encontrado`);
        }
        return certificado;
    }
    async update(id, updateCertificadoDto) {
        const certificado = await this.findOne(id);
        if (updateCertificadoDto.fecha_emision) {
            updateCertificadoDto.fecha_emision = new Date(updateCertificadoDto.fecha_emision).toISOString();
        }
        if (updateCertificadoDto.fecha_expiracion) {
            updateCertificadoDto.fecha_expiracion = new Date(updateCertificadoDto.fecha_expiracion).toISOString();
        }
        Object.assign(certificado, updateCertificadoDto);
        return await this.certificadoRepository.save(certificado);
    }
    async remove(id) {
        const certificado = await this.findOne(id);
        await this.certificadoRepository.remove(certificado);
    }
    generateVerificationCode() {
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        return `CERT-${randomStr}-${timestamp}`;
    }
};
exports.CertificadoService = CertificadoService;
exports.CertificadoService = CertificadoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(certificado_entity_1.Certificado)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CertificadoService);
//# sourceMappingURL=certificado.service.js.map