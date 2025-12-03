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
exports.SmartAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tarea_entity_1 = require("../tarea/tarea.entity");
const rol_entity_1 = require("../rol/rol.entity");
const asignacion_entity_1 = require("./asignacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
let SmartAssignmentService = class SmartAssignmentService {
    constructor(tareaRepo, rolRepo, asignacionRepo, voluntarioRepo) {
        this.tareaRepo = tareaRepo;
        this.rolRepo = rolRepo;
        this.asignacionRepo = asignacionRepo;
        this.voluntarioRepo = voluntarioRepo;
    }
    async generateSmartSuggestions(request) {
        var _a, _b;
        const availableTasks = await this.getAvailableTasks(request.id_proyecto);
        const availableRoles = await this.getAvailableRoles(request.id_proyecto);
        const volunteer = await this.voluntarioRepo.findOne({
            where: { id_voluntario: request.id_voluntario },
            relations: ['usuario']
        });
        if (!volunteer || availableTasks.length === 0) {
            return [];
        }
        const suggestions = [];
        for (const task of availableTasks) {
            const compatibility = await this.calculateCompatibility(task, volunteer, request);
            const suggestedRole = this.selectBestRole(availableRoles, task, volunteer);
            if (compatibility > 30 && suggestedRole) {
                suggestions.push({
                    id: task.id_tarea,
                    descripcion: task.descripcion,
                    prioridad: task.prioridad || 'Media',
                    fase: {
                        nombre: ((_a = task.fase) === null || _a === void 0 ? void 0 : _a.nombre) || 'Sin fase',
                        id_fase: ((_b = task.fase) === null || _b === void 0 ? void 0 : _b.id_fase) || 0
                    },
                    role: {
                        id_rol: suggestedRole.id_rol,
                        nombre: suggestedRole.nombre,
                        color: suggestedRole.color || '#2196F3'
                    },
                    compatibility,
                    reasons: this.generateReasons(task, volunteer, compatibility, request)
                });
            }
        }
        return suggestions
            .sort((a, b) => b.compatibility - a.compatibility)
            .slice(0, 5);
    }
    async getAvailableTasks(projectId) {
        return await this.tareaRepo
            .createQueryBuilder('tarea')
            .leftJoinAndSelect('tarea.fase', 'fase')
            .leftJoinAndSelect('tarea.estado', 'estado')
            .leftJoinAndSelect('tarea.asignaciones', 'asignaciones')
            .where('fase.id_proyecto = :projectId', { projectId })
            .andWhere('tarea.id_estado IN (1, 2)')
            .orderBy('tarea.prioridad', 'DESC')
            .addOrderBy('tarea.fecha_fin', 'ASC')
            .getMany();
    }
    async getAvailableRoles(projectId) {
        return await this.rolRepo
            .createQueryBuilder('rol')
            .where('rol.activo = true')
            .andWhere('(rol.tipo_rol = :tipoProyecto AND rol.id_proyecto = :projectId) OR ' +
            '(rol.tipo_rol = :tipoOrg AND rol.id_organizacion = (SELECT p.id_organizacion FROM proyecto p WHERE p.id_proyecto = :projectId))', {
            tipoProyecto: 'proyecto',
            tipoOrg: 'organizacion',
            projectId
        })
            .orderBy('rol.tipo_rol', 'DESC')
            .getMany();
    }
    async calculateCompatibility(task, volunteer, request) {
        var _a, _b;
        let compatibility = 50;
        const reasons = [];
        switch ((_a = task.prioridad) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
            case 'alta':
                compatibility += 20;
                reasons.push('Tarea de alta prioridad');
                break;
            case 'media':
                compatibility += 10;
                break;
            case 'baja':
                compatibility += 5;
                break;
        }
        const currentAssignments = ((_b = task.asignaciones) === null || _b === void 0 ? void 0 : _b.length) || 0;
        if (currentAssignments === 0) {
            compatibility += 15;
            reasons.push('Tarea sin asignar');
        }
        else if (currentAssignments < 2) {
            compatibility += 10;
            reasons.push('Poca carga de trabajo');
        }
        else {
            compatibility += 5;
        }
        if (task.fecha_fin) {
            const daysUntilDeadline = this.getDaysUntilDeadline(task.fecha_fin);
            if (daysUntilDeadline <= 7) {
                compatibility += 10;
                reasons.push('Fecha límite próxima');
            }
            else if (daysUntilDeadline <= 30) {
                compatibility += 5;
            }
        }
        if (request.experiencia) {
            const experienceMatch = this.calculateExperienceMatch(task.descripcion, request.experiencia);
            compatibility += experienceMatch;
            if (experienceMatch > 10) {
                reasons.push('Experiencia relacionada');
            }
        }
        if (request.motivacion) {
            const motivationMatch = this.calculateMotivationMatch(task.descripcion, request.motivacion);
            compatibility += motivationMatch;
            if (motivationMatch > 5) {
                reasons.push('Alineado con motivación');
            }
        }
        return Math.min(100, Math.max(0, compatibility));
    }
    selectBestRole(roles, task, volunteer) {
        if (roles.length === 0)
            return null;
        const projectRoles = roles.filter(r => r.tipo_rol === 'proyecto');
        const orgRoles = roles.filter(r => r.tipo_rol === 'organizacion');
        if (projectRoles.length > 0) {
            return projectRoles[0];
        }
        if (orgRoles.length > 0) {
            return orgRoles[0];
        }
        return roles[0];
    }
    generateReasons(task, volunteer, compatibility, request) {
        const reasons = [];
        if (task.prioridad === 'Alta') {
            reasons.push('Tarea de alta prioridad que requiere atención inmediata');
        }
        if (!task.asignaciones || task.asignaciones.length === 0) {
            reasons.push('Tarea disponible sin asignaciones previas');
        }
        if (task.fecha_fin) {
            const days = this.getDaysUntilDeadline(task.fecha_fin);
            if (days <= 7) {
                reasons.push(`Fecha límite en ${days} días`);
            }
        }
        if (compatibility > 80) {
            reasons.push('Alta compatibilidad con el perfil del voluntario');
        }
        else if (compatibility > 60) {
            reasons.push('Buena compatibilidad con el perfil del voluntario');
        }
        return reasons.slice(0, 3);
    }
    getDaysUntilDeadline(fechaFin) {
        const now = new Date();
        const deadline = new Date(fechaFin);
        const diffTime = deadline.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    calculateExperienceMatch(taskDescription, experience) {
        if (!taskDescription || !experience)
            return 0;
        const taskWords = this.extractKeywords(taskDescription.toLowerCase());
        const expWords = this.extractKeywords(experience.toLowerCase());
        const matches = taskWords.filter(word => expWords.includes(word));
        const matchRatio = matches.length / Math.max(taskWords.length, 1);
        return Math.round(matchRatio * 15);
    }
    calculateMotivationMatch(taskDescription, motivation) {
        if (!taskDescription || !motivation)
            return 0;
        const taskWords = this.extractKeywords(taskDescription.toLowerCase());
        const motWords = this.extractKeywords(motivation.toLowerCase());
        const matches = taskWords.filter(word => motWords.includes(word));
        const matchRatio = matches.length / Math.max(taskWords.length, 1);
        return Math.round(matchRatio * 10);
    }
    extractKeywords(text) {
        const stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'han', 'me', 'si', 'sin', 'sobre', 'este', 'ya', 'entre', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'también', 'fue', 'había', 'era', 'muy', 'años', 'hasta', 'desde', 'está', 'mi', 'porque', 'qué', 'sólo', 'han', 'yo', 'hay', 'vez', 'puede', 'todos', 'así', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'bien', 'tiempo', 'mismo', 'ese', 'ahora', 'cada', 'e', 'vida', 'otro', 'después', 'te', 'otros', 'aunque', 'esa', 'eso', 'hace', 'otra', 'gobierno', 'tan', 'durante', 'siempre', 'día', 'tanto', 'ella', 'tres', 'sí', 'dijo', 'sido', 'gran', 'país', 'según', 'menos', 'mundo', 'año', 'antes', 'estado', 'quiero', 'mientras', 'sin', 'lugar', 'solo', 'nosotros', 'poder', 'decir', 'agua', 'más', 'nueva', 'muchos', 'hombre', 'días', 'muchas', 'manera', 'cosas', 'hoy', 'mayor', 'nada', 'llegar', 'hijo', 'vez', 'grupo', 'empresa', 'caso', 'semana', 'mano', 'sistema', 'después', 'trabajo', 'vida', 'ser', 'podría', 'primera', 'vez', 'hecho', 'mujer', 'usted', 'forma', 'contra', 'aquí', 'saber', 'agua', 'punto', 'derecha', 'pequeño', 'gran', 'mundo'];
        return text
            .split(/\s+/)
            .map(word => word.replace(/[^\w]/g, ''))
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 10);
    }
};
exports.SmartAssignmentService = SmartAssignmentService;
exports.SmartAssignmentService = SmartAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(1, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(2, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(3, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SmartAssignmentService);
//# sourceMappingURL=smart-assignment.service.js.map