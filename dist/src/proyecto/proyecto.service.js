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
exports.ProyectoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proyecto_entity_1 = require("./proyecto.entity");
const organizacion_entity_1 = require("../organizacion/organizacion.entity");
const fase_entity_1 = require("../fase/fase.entity");
const tarea_entity_1 = require("../tarea/tarea.entity");
const proyecto_beneficio_entity_1 = require("../proyecto-beneficio/proyecto-beneficio.entity");
const asignacion_entity_1 = require("../asignacion/asignacion.entity");
const voluntario_entity_1 = require("../voluntario/voluntario.entity");
const rol_entity_1 = require("../rol/rol.entity");
const horas_voluntariadas_entity_1 = require("../horas-voluntariadas/horas-voluntariadas.entity");
const estado_entity_1 = require("../estado/estado.entity");
const notificacion_service_1 = require("../notificacion/notificacion.service");
const solicitud_inscripcion_entity_1 = require("../solicitud-inscripcion/solicitud-inscripcion.entity");
let ProyectoService = class ProyectoService {
    constructor(repo, orgRepo, faseRepo, tareaRepo, beneficioRepo, asignacionRepo, voluntarioRepo, rolRepo, horasRepo, estadoRepo, solicitudRepo, notificacionService) {
        this.repo = repo;
        this.orgRepo = orgRepo;
        this.faseRepo = faseRepo;
        this.tareaRepo = tareaRepo;
        this.beneficioRepo = beneficioRepo;
        this.asignacionRepo = asignacionRepo;
        this.voluntarioRepo = voluntarioRepo;
        this.rolRepo = rolRepo;
        this.horasRepo = horasRepo;
        this.estadoRepo = estadoRepo;
        this.solicitudRepo = solicitudRepo;
        this.notificacionService = notificacionService;
    }
    async create(dto, user) {
        if (!dto.nombre || dto.nombre.trim() === '') {
            throw new common_1.BadRequestException('El nombre del proyecto es requerido');
        }
        if (dto.nombre.trim().length < 3) {
            throw new common_1.BadRequestException('El nombre del proyecto debe tener al menos 3 caracteres');
        }
        if (dto.nombre.trim().length > 100) {
            throw new common_1.BadRequestException('El nombre del proyecto no puede exceder 100 caracteres');
        }
        if (!dto.descripcion || dto.descripcion.trim() === '') {
            throw new common_1.BadRequestException('La descripción del proyecto es requerida');
        }
        if (dto.descripcion.trim().length < 10) {
            throw new common_1.BadRequestException('La descripción del proyecto debe tener al menos 10 caracteres');
        }
        if (!dto.objetivo || dto.objetivo.trim() === '') {
            throw new common_1.BadRequestException('El objetivo del proyecto es requerido');
        }
        if (dto.objetivo.trim().length < 10) {
            throw new common_1.BadRequestException('El objetivo del proyecto debe tener al menos 10 caracteres');
        }
        if (!dto.ubicacion || dto.ubicacion.trim() === '') {
            throw new common_1.BadRequestException('La ubicación del proyecto es requerida');
        }
        if (!dto.fecha_inicio) {
            throw new common_1.BadRequestException('La fecha de inicio es requerida');
        }
        if (!dto.fecha_fin) {
            throw new common_1.BadRequestException('La fecha de fin es requerida');
        }
        const fechaInicio = new Date(dto.fecha_inicio);
        const fechaFin = new Date(dto.fecha_fin);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);
        if (fechaInicio > fechaFin) {
            throw new common_1.BadRequestException('La fecha de inicio debe ser anterior o igual a la fecha de fin');
        }
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        unAnoAtras.setHours(0, 0, 0, 0);
        if (fechaInicio < unAnoAtras) {
            throw new common_1.BadRequestException('La fecha de inicio no puede ser anterior a hace un año');
        }
        if (dto.presupuesto_total !== undefined && dto.presupuesto_total !== null) {
            if (dto.presupuesto_total < 0) {
                throw new common_1.BadRequestException('El presupuesto no puede ser negativo');
            }
            if (dto.presupuesto_total > 999999999999.99) {
                throw new common_1.BadRequestException('El presupuesto excede el límite máximo permitido');
            }
        }
        if (dto.imagen_principal) {
            this.validateImageUrl(dto.imagen_principal);
        }
        if (dto.banner) {
            this.validateImageUrl(dto.banner);
        }
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (!organizacion) {
            throw new common_1.NotFoundException('Organizacion no encontrada para el usuario');
        }
        let id_estado = dto.id_estado || 1;
        if (id_estado === 0) {
            id_estado = 1;
        }
        const estado = await this.estadoRepo.findOne({ where: { id_estado } });
        if (!estado) {
            throw new common_1.NotFoundException(`Estado con ID ${id_estado} no encontrado`);
        }
        const proyecto = this.repo.create({
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion.trim(),
            objetivo: dto.objetivo.trim(),
            ubicacion: dto.ubicacion.trim(),
            fecha_inicio: dto.fecha_inicio,
            fecha_fin: dto.fecha_fin,
            imagen_principal: dto.imagen_principal || '/assets/images/background_login.png',
            banner: dto.banner || null,
            documento: dto.documento || null,
            presupuesto_total: dto.presupuesto_total || 0,
            categoria: dto.categoria || null,
            es_publico: dto.es_publico !== undefined ? dto.es_publico : true,
            requisitos: dto.requisitos || null,
            id_estado: id_estado,
            id_organizacion: organizacion.id_organizacion
        });
        return this.repo.save(proyecto);
    }
    validateImageUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new common_1.BadRequestException('La URL de la imagen debe ser una cadena de texto válida');
        }
        try {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol.toLowerCase();
            if (protocol !== 'http:' && protocol !== 'https:' && !url.startsWith('/')) {
                throw new common_1.BadRequestException('La URL de la imagen debe ser una URL válida (http/https) o una ruta relativa');
            }
            if (protocol === 'http:' || protocol === 'https:') {
                const pathname = urlObj.pathname.toLowerCase();
                const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
                if (!hasValidExtension && !pathname.includes('data:image')) {
                    if (!url.startsWith('data:image/')) {
                        throw new common_1.BadRequestException(`La URL de la imagen debe tener una extensión válida (${validExtensions.join(', ')}) o ser una imagen base64`);
                    }
                }
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (!url.startsWith('/') && !url.startsWith('data:image/')) {
                throw new common_1.BadRequestException('La URL de la imagen no es válida');
            }
        }
    }
    async findAll(user) {
        try {
            if (user.tipo_usuario === 'admin') {
                const proyectos = await this.repo.find({
                    relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'beneficio'],
                    order: { creado_en: 'DESC' }
                });
                return proyectos || [];
            }
            if (user.tipo_usuario === 'organizacion') {
                const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
                if (!organizacion) {
                    return [];
                }
                const proyectos = await this.repo.find({
                    where: { id_organizacion: organizacion.id_organizacion },
                    relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'beneficio'],
                    order: { creado_en: 'DESC' }
                });
                return proyectos || [];
            }
            if (user.tipo_usuario === 'voluntario') {
                return this.findProjectsByVoluntario(user.id_usuario);
            }
            return [];
        }
        catch (error) {
            console.error('Error en findAll proyectos:', error);
            try {
                if (user.tipo_usuario === 'admin') {
                    const proyectos = await this.repo.find({
                        relations: ['organizacion', 'estado', 'fases'],
                        order: { creado_en: 'DESC' }
                    });
                    for (const proyecto of proyectos) {
                        if (proyecto.fases && proyecto.fases.length > 0) {
                            for (const fase of proyecto.fases) {
                                try {
                                    fase.tareas = await this.tareaRepo.find({
                                        where: { id_fase: fase.id_fase },
                                    });
                                }
                                catch (tareaError) {
                                    console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
                                    fase.tareas = [];
                                }
                            }
                        }
                    }
                    return proyectos || [];
                }
                if (user.tipo_usuario === 'organizacion') {
                    const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
                    if (organizacion) {
                        const proyectos = await this.repo.find({
                            where: { id_organizacion: organizacion.id_organizacion },
                            relations: ['organizacion', 'estado', 'fases'],
                            order: { creado_en: 'DESC' }
                        });
                        for (const proyecto of proyectos) {
                            if (proyecto.fases && proyecto.fases.length > 0) {
                                for (const fase of proyecto.fases) {
                                    try {
                                        fase.tareas = await this.tareaRepo.find({
                                            where: { id_fase: fase.id_fase },
                                        });
                                    }
                                    catch (tareaError) {
                                        console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
                                        fase.tareas = [];
                                    }
                                }
                            }
                        }
                        return proyectos || [];
                    }
                }
            }
            catch (fallbackError) {
                console.error('Error en fallback findAll:', fallbackError);
            }
            return [];
        }
    }
    async findOne(id) {
        try {
            const proyecto = await this.repo.findOne({
                where: { id_proyecto: id },
                relations: ['organizacion', 'estado', 'fases', 'fases.tareas', 'fases.tareas.asignaciones', 'fases.tareas.asignaciones.rol', 'fases.tareas.asignaciones.voluntario', 'fases.tareas.asignaciones.voluntario.usuario', 'beneficio'],
            });
            if (!proyecto) {
                throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
            }
            return proyecto;
        }
        catch (error) {
            console.error('Error loading proyecto with relations:', error);
            const proyecto = await this.repo.findOne({
                where: { id_proyecto: id },
                relations: ['organizacion', 'estado', 'fases', 'beneficio'],
            });
            if (!proyecto) {
                throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
            }
            if (proyecto.fases && proyecto.fases.length > 0) {
                for (const fase of proyecto.fases) {
                    try {
                        const tareas = await this.tareaRepo.find({
                            where: { id_fase: fase.id_fase },
                            relations: ['asignaciones', 'asignaciones.rol', 'asignaciones.voluntario', 'asignaciones.voluntario.usuario'],
                        });
                        fase.tareas = tareas || [];
                    }
                    catch (tareaError) {
                        console.error(`Error loading tasks for phase ${fase.id_fase}:`, tareaError);
                        fase.tareas = [];
                    }
                }
            }
            return proyecto;
        }
    }
    async findPublicProjects() {
        try {
            const proyectos = await this.repo.find({
                where: [
                    {
                        es_publico: true,
                        id_estado: 1
                    },
                    {
                        es_publico: true,
                        id_estado: 7
                    },
                    {
                        es_publico: true,
                        id_estado: 5
                    },
                    {
                        es_publico: true,
                        id_estado: 6
                    }
                ],
                relations: ['organizacion', 'estado', 'beneficio'],
                order: { creado_en: 'DESC' }
            });
            return proyectos || [];
        }
        catch (error) {
            console.error('Error loading public projects:', error);
            try {
                const proyectos = await this.repo.find({
                    where: {
                        es_publico: true
                    },
                    relations: ['organizacion', 'estado', 'beneficio'],
                    order: { creado_en: 'DESC' }
                });
                return proyectos.filter(p => {
                    var _a, _b;
                    const estadoNombre = ((_b = (_a = p.estado) === null || _a === void 0 ? void 0 : _a.nombre) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                    const estadoId = p.id_estado;
                    return estadoId !== 2 &&
                        estadoId !== 3 &&
                        estadoId !== 4 &&
                        estadoId !== 9 &&
                        !estadoNombre.includes('cerrado');
                }) || [];
            }
            catch (fallbackError) {
                console.error('Error en fallback de findPublicProjects:', fallbackError);
                return [];
            }
        }
    }
    async update(id, dto, user) {
        const proyecto = await this.findOne(id);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar este proyecto.');
        }
        if (dto.fecha_inicio || dto.fecha_fin) {
            const nuevaFechaInicio = dto.fecha_inicio
                ? (typeof dto.fecha_inicio === 'string' ? new Date(dto.fecha_inicio) : dto.fecha_inicio)
                : proyecto.fecha_inicio;
            const nuevaFechaFin = dto.fecha_fin
                ? (typeof dto.fecha_fin === 'string' ? new Date(dto.fecha_fin) : dto.fecha_fin)
                : proyecto.fecha_fin;
            if (nuevaFechaInicio > nuevaFechaFin) {
                throw new common_1.BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            const fases = await this.faseRepo.find({
                where: { id_proyecto: id },
                relations: ['tareas']
            });
            for (const fase of fases) {
                if (fase.fecha_inicio && new Date(fase.fecha_inicio) < nuevaFechaInicio) {
                    throw new common_1.BadRequestException(`La fase "${fase.nombre}" tiene una fecha de inicio (${fase.fecha_inicio}) anterior a la nueva fecha de inicio del proyecto`);
                }
                if (fase.fecha_fin && new Date(fase.fecha_fin) > nuevaFechaFin) {
                    throw new common_1.BadRequestException(`La fase "${fase.nombre}" tiene una fecha de fin (${fase.fecha_fin}) posterior a la nueva fecha de fin del proyecto`);
                }
                if (fase.tareas && fase.tareas.length > 0) {
                    for (const tarea of fase.tareas) {
                        if (tarea.fecha_inicio && new Date(tarea.fecha_inicio) < nuevaFechaInicio) {
                            throw new common_1.BadRequestException(`La tarea "${tarea.descripcion.substring(0, 50)}..." tiene una fecha de inicio anterior a la nueva fecha de inicio del proyecto`);
                        }
                        if (tarea.fecha_fin && new Date(tarea.fecha_fin) > nuevaFechaFin) {
                            throw new common_1.BadRequestException(`La tarea "${tarea.descripcion.substring(0, 50)}..." tiene una fecha de fin posterior a la nueva fecha de fin del proyecto`);
                        }
                    }
                }
            }
        }
        const estadoAnteriorId = proyecto.id_estado;
        let estadoAnteriorNombre = 'Desconocido';
        let estadoNuevoNombre = 'Desconocido';
        if (dto.id_estado !== undefined && dto.id_estado !== estadoAnteriorId) {
            const estadoAnterior = await this.estadoRepo.findOne({ where: { id_estado: estadoAnteriorId } });
            const estadoNuevo = await this.estadoRepo.findOne({ where: { id_estado: dto.id_estado } });
            estadoAnteriorNombre = (estadoAnterior === null || estadoAnterior === void 0 ? void 0 : estadoAnterior.nombre) || 'Desconocido';
            estadoNuevoNombre = (estadoNuevo === null || estadoNuevo === void 0 ? void 0 : estadoNuevo.nombre) || 'Desconocido';
        }
        if (dto.presupuesto_total !== undefined) {
            if (dto.presupuesto_total < 0) {
                throw new common_1.BadRequestException('El presupuesto no puede ser negativo');
            }
            if (dto.presupuesto_total > 999999999999.99) {
                throw new common_1.BadRequestException('El presupuesto excede el límite máximo permitido');
            }
            const { DonacionProyecto } = await Promise.resolve().then(() => require('../donacion-proyecto/donacion-proyecto.entity'));
            const donacionProyectoRepo = this.repo.manager.getRepository(DonacionProyecto);
            const donacionesAsignadas = await donacionProyectoRepo
                .createQueryBuilder('dp')
                .where('dp.id_proyecto = :id_proyecto', { id_proyecto: id })
                .select('SUM(dp.monto_asignado)', 'total')
                .getRawOne();
            const totalDonaciones = parseFloat((donacionesAsignadas === null || donacionesAsignadas === void 0 ? void 0 : donacionesAsignadas.total) || '0');
            if (dto.presupuesto_total < totalDonaciones) {
                throw new common_1.BadRequestException(`El presupuesto (${dto.presupuesto_total.toLocaleString()}) no puede ser menor que el total de donaciones asignadas (${totalDonaciones.toLocaleString()})`);
            }
        }
        if (dto.imagen_principal !== undefined) {
            this.validateImageUrl(dto.imagen_principal);
        }
        if (dto.banner !== undefined && dto.banner) {
            this.validateImageUrl(dto.banner);
        }
        if (dto.nombre !== undefined) {
            if (dto.nombre.trim().length < 3) {
                throw new common_1.BadRequestException('El nombre del proyecto debe tener al menos 3 caracteres');
            }
            if (dto.nombre.trim().length > 100) {
                throw new common_1.BadRequestException('El nombre del proyecto no puede exceder 100 caracteres');
            }
            proyecto.nombre = dto.nombre.trim();
        }
        if (dto.descripcion !== undefined) {
            if (dto.descripcion.trim().length < 10) {
                throw new common_1.BadRequestException('La descripción del proyecto debe tener al menos 10 caracteres');
            }
            proyecto.descripcion = dto.descripcion.trim();
        }
        if (dto.objetivo !== undefined) {
            if (dto.objetivo.trim().length < 10) {
                throw new common_1.BadRequestException('El objetivo del proyecto debe tener al menos 10 caracteres');
            }
            proyecto.objetivo = dto.objetivo.trim();
        }
        if (dto.ubicacion !== undefined)
            proyecto.ubicacion = dto.ubicacion.trim();
        if (dto.fecha_inicio !== undefined)
            proyecto.fecha_inicio = typeof dto.fecha_inicio === 'string' ? new Date(dto.fecha_inicio) : dto.fecha_inicio;
        if (dto.fecha_fin !== undefined)
            proyecto.fecha_fin = typeof dto.fecha_fin === 'string' ? new Date(dto.fecha_fin) : dto.fecha_fin;
        if (dto.imagen_principal !== undefined)
            proyecto.imagen_principal = dto.imagen_principal;
        if (dto.documento !== undefined)
            proyecto.documento = dto.documento;
        if (dto.presupuesto_total !== undefined)
            proyecto.presupuesto_total = dto.presupuesto_total;
        if (dto.categoria !== undefined)
            proyecto.categoria = dto.categoria;
        if (dto.es_publico !== undefined)
            proyecto.es_publico = dto.es_publico;
        if (dto.requisitos !== undefined)
            proyecto.requisitos = dto.requisitos;
        if (dto.id_estado !== undefined)
            proyecto.id_estado = dto.id_estado;
        if (dto.banner !== undefined)
            proyecto.banner = dto.banner;
        const proyectoActualizado = await this.repo.save(proyecto);
        if (dto.id_estado !== undefined && dto.id_estado !== estadoAnteriorId) {
            try {
                await this.notificacionService.notificarCambioEstadoProyecto(proyecto.id_proyecto, proyecto.id_organizacion, estadoAnteriorNombre, estadoNuevoNombre, proyecto.nombre);
            }
            catch (error) {
                console.error('Error al notificar cambio de estado:', error);
            }
        }
        return proyectoActualizado;
    }
    async remove(id, user) {
        const proyecto = await this.findOne(id);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar este proyecto.');
        }
        const asignaciones = await this.asignacionRepo
            .createQueryBuilder('asignacion')
            .innerJoin('asignacion.tarea', 'tarea')
            .innerJoin('tarea.fase', 'fase')
            .where('fase.id_proyecto = :idProyecto', { idProyecto: id })
            .getCount();
        if (asignaciones > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el proyecto porque tiene ${asignaciones} asignación(es) activa(s). Por favor, elimina primero todas las asignaciones de voluntarios.`);
        }
        const horasVoluntariadas = await this.horasRepo.count({
            where: { id_proyecto: id }
        });
        if (horasVoluntariadas > 0) {
            throw new common_1.BadRequestException(`No se puede eliminar el proyecto porque tiene ${horasVoluntariadas} registro(s) de horas voluntariadas. Por favor, elimina primero todos los registros de horas.`);
        }
        try {
            return await this.repo.remove(proyecto);
        }
        catch (error) {
            const errorMessage = error.message || '';
            const errorCode = error.code || '';
            if (errorCode === 'ER_ROW_IS_REFERENCED_2' ||
                errorCode === '23503' ||
                errorMessage.includes('foreign key constraint') ||
                errorMessage.includes('Cannot delete or update a parent row')) {
                throw new common_1.BadRequestException('No se puede eliminar el proyecto porque tiene registros relacionados (solicitudes, donaciones, etc.). Por favor, elimina primero todos los registros relacionados.');
            }
            throw error;
        }
    }
    async addFase(proyectoId, dto, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para agregar fases a este proyecto.');
        }
        const fase = this.faseRepo.create({
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion.trim(),
            orden: dto.orden,
            id_proyecto: proyectoId,
        });
        const savedFase = await this.faseRepo.save(fase);
        console.log(`Fase creada exitosamente:`, savedFase);
        return this.findOne(proyectoId);
    }
    async updateFase(proyectoId, faseId, dto, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar fases de este proyecto.');
        }
        const fase = await this.faseRepo.findOne({
            where: { id_fase: faseId, id_proyecto: proyectoId },
        });
        if (!fase) {
            throw new common_1.NotFoundException(`Fase con ID ${faseId} no encontrada en el proyecto ${proyectoId}`);
        }
        this.faseRepo.merge(fase, dto);
        await this.faseRepo.save(fase);
        return this.findOne(proyectoId);
    }
    async reorderFases(proyectoId, ordenes, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para reordenar las fases de este proyecto.');
        }
        const faseIds = ordenes.map(o => o.id_fase);
        const fases = await this.faseRepo.find({
            where: faseIds.map(id => ({ id_fase: id, id_proyecto: proyectoId }))
        });
        if (fases.length !== ordenes.length) {
            throw new common_1.BadRequestException('Algunas fases no pertenecen a este proyecto');
        }
        const updates = ordenes.map(({ id_fase, orden }) => this.faseRepo.update(id_fase, { orden }));
        await Promise.all(updates);
        return this.findOne(proyectoId);
    }
    async removeFase(proyectoId, faseId, user) {
        var _a;
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar fases de este proyecto.');
        }
        const fase = await this.faseRepo.findOne({
            where: { id_fase: faseId, id_proyecto: proyectoId },
            relations: ['tareas', 'tareas.estado']
        });
        if (!fase) {
            throw new common_1.NotFoundException(`Fase con ID ${faseId} no encontrada en el proyecto ${proyectoId}`);
        }
        if (fase.tareas && fase.tareas.length > 0) {
            const tareasCompletadas = [];
            const tareasConAsignaciones = [];
            const tareasConHoras = [];
            const estadosCompletados = ['Completado', 'Finalizado', 'Terminado', 'Cerrado', 'Completada', 'Finalizada'];
            for (const tarea of fase.tareas) {
                if (!tarea.estado && tarea.id_estado) {
                    tarea.estado = await this.estadoRepo.findOne({ where: { id_estado: tarea.id_estado } });
                }
                const estadoNombre = ((_a = tarea.estado) === null || _a === void 0 ? void 0 : _a.nombre) || '';
                const estaCompletada = estadosCompletados.some(estado => estadoNombre.toLowerCase().includes(estado.toLowerCase()));
                if (estaCompletada) {
                    tareasCompletadas.push(tarea);
                }
                const asignaciones = await this.asignacionRepo.find({
                    where: { id_tarea: tarea.id_tarea }
                });
                if (asignaciones.length > 0) {
                    tareasConAsignaciones.push({ tarea, count: asignaciones.length });
                }
                const horasVoluntariadas = await this.horasRepo.find({
                    where: { id_tarea: tarea.id_tarea }
                });
                if (horasVoluntariadas.length > 0) {
                    tareasConHoras.push({ tarea, count: horasVoluntariadas.length });
                }
            }
            const mensajesError = [];
            if (tareasCompletadas.length > 0) {
                mensajesError.push(`La fase tiene ${tareasCompletadas.length} tarea(s) completada(s). ` +
                    `Eliminar una fase con tareas completadas puede afectar el historial del proyecto. ` +
                    `Por favor, verifica que realmente deseas eliminar esta fase.`);
            }
            if (tareasConAsignaciones.length > 0) {
                const totalAsignaciones = tareasConAsignaciones.reduce((sum, item) => sum + item.count, 0);
                mensajesError.push(`La fase tiene ${tareasConAsignaciones.length} tarea(s) con ${totalAsignaciones} asignación(es) activa(s). ` +
                    `Por favor, elimina primero todas las asignaciones de las tareas de esta fase.`);
            }
            if (tareasConHoras.length > 0) {
                const totalHoras = tareasConHoras.reduce((sum, item) => sum + item.count, 0);
                mensajesError.push(`La fase tiene ${tareasConHoras.length} tarea(s) con ${totalHoras} registro(s) de horas voluntariadas. ` +
                    `Por favor, elimina primero todos los registros de horas de las tareas de esta fase.`);
            }
            if (tareasCompletadas.length > 0 && tareasConAsignaciones.length === 0 && tareasConHoras.length === 0) {
                throw new common_1.BadRequestException(`ADVERTENCIA: La fase tiene ${tareasCompletadas.length} tarea(s) completada(s). ` +
                    `Eliminar esta fase eliminará el historial de estas tareas completadas. ` +
                    `Si estás seguro, puedes proceder eliminando primero las tareas completadas manualmente.`);
            }
            if (tareasConAsignaciones.length > 0 || tareasConHoras.length > 0) {
                throw new common_1.BadRequestException(mensajesError.join(' '));
            }
        }
        await this.faseRepo.remove(fase);
        return this.findOne(proyectoId);
    }
    async addTarea(proyectoId, dto, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para agregar tareas a este proyecto.');
        }
        const fase = await this.faseRepo.findOne({
            where: { id_fase: dto.id_fase, id_proyecto: proyectoId },
        });
        if (!fase) {
            throw new common_1.NotFoundException(`Fase con ID ${dto.id_fase} no encontrada en el proyecto ${proyectoId}`);
        }
        const tarea = this.tareaRepo.create(dto);
        await this.tareaRepo.save(tarea);
        return this.findOne(proyectoId);
    }
    async updateTarea(proyectoId, tareaId, dto, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para actualizar tareas de este proyecto.');
        }
        const tarea = await this.tareaRepo.findOne({
            where: { id_tarea: tareaId },
            relations: ['fase'],
        });
        if (!tarea || tarea.fase.id_proyecto !== proyectoId) {
            throw new common_1.NotFoundException(`Tarea con ID ${tareaId} no encontrada en el proyecto ${proyectoId}`);
        }
        this.tareaRepo.merge(tarea, dto);
        await this.tareaRepo.save(tarea);
        return this.findOne(proyectoId);
    }
    async removeTarea(proyectoId, tareaId, user) {
        const proyecto = await this.findOne(proyectoId);
        const organizacion = await this.orgRepo.findOne({ where: { id_usuario: user.id_usuario } });
        if (user.tipo_usuario !== 'admin' && proyecto.id_organizacion !== organizacion.id_organizacion) {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar tareas de este proyecto.');
        }
        const tarea = await this.tareaRepo.findOne({
            where: { id_tarea: tareaId },
            relations: ['fase'],
        });
        if (!tarea || tarea.fase.id_proyecto !== proyectoId) {
            throw new common_1.NotFoundException(`Tarea con ID ${tareaId} no encontrada en el proyecto ${proyectoId}`);
        }
        await this.tareaRepo.remove(tarea);
        return this.findOne(proyectoId);
    }
    async findProjectsByVoluntario(id_usuario) {
        try {
            const voluntario = await this.voluntarioRepo.findOne({
                where: { id_usuario },
                relations: ['usuario']
            });
            if (!voluntario) {
                console.log(`Voluntario no encontrado para usuario ${id_usuario}`);
                return [];
            }
            console.log(`Buscando proyectos para voluntario ${voluntario.id_voluntario}`);
            let asignaciones;
            try {
                asignaciones = await this.asignacionRepo.find({
                    where: { id_voluntario: voluntario.id_voluntario },
                    relations: ['tarea', 'tarea.fase', 'tarea.fase.proyecto', 'rol']
                });
            }
            catch (relationError) {
                console.error('Error cargando asignaciones con relaciones:', relationError);
                asignaciones = await this.asignacionRepo.find({
                    where: { id_voluntario: voluntario.id_voluntario }
                });
                for (const asignacion of asignaciones) {
                    try {
                        const tarea = await this.tareaRepo.findOne({
                            where: { id_tarea: asignacion.id_tarea },
                            relations: ['fase', 'fase.proyecto']
                        });
                        asignacion.tarea = tarea;
                        if (asignacion.id_rol) {
                            const rol = await this.rolRepo.findOne({
                                where: { id_rol: asignacion.id_rol }
                            });
                            asignacion.rol = rol;
                        }
                    }
                    catch (loadError) {
                        console.error(`Error cargando relaciones para asignación ${asignacion.id_asignacion}:`, loadError);
                    }
                }
            }
            const solicitudesAprobadas = await this.solicitudRepo.find({
                where: {
                    id_voluntario: voluntario.id_voluntario,
                    estado: 'aprobada'
                },
                relations: ['proyecto']
            });
            console.log(`Encontradas ${asignaciones.length} asignaciones y ${solicitudesAprobadas.length} solicitudes aprobadas`);
            const proyectosMap = new Map();
            asignaciones.forEach(asignacion => {
                var _a, _b;
                const proyecto = (_b = (_a = asignacion.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.proyecto;
                if (!proyecto)
                    return;
                const proyectoId = proyecto.id_proyecto;
                if (!proyectosMap.has(proyectoId)) {
                    proyectosMap.set(proyectoId, {
                        proyecto: proyecto,
                        roles: new Set(),
                        rolesArray: [],
                        tieneAsignaciones: true,
                        tieneSolicitudAprobada: false
                    });
                }
                const proyectoData = proyectosMap.get(proyectoId);
                proyectoData.tieneAsignaciones = true;
                if (asignacion.rol) {
                    proyectoData.roles.add(asignacion.rol.id_rol);
                }
            });
            for (const solicitud of solicitudesAprobadas) {
                const proyectoId = solicitud.id_proyecto;
                if (!proyectosMap.has(proyectoId)) {
                    let proyecto = solicitud.proyecto;
                    if (!proyecto && proyectoId) {
                        proyecto = await this.repo.findOne({
                            where: { id_proyecto: proyectoId },
                            relations: ['organizacion', 'estado']
                        });
                    }
                    if (proyecto) {
                        proyectosMap.set(proyectoId, {
                            proyecto: proyecto,
                            roles: new Set(),
                            rolesArray: [],
                            tieneAsignaciones: false,
                            tieneSolicitudAprobada: true
                        });
                    }
                }
                else {
                    proyectosMap.get(proyectoId).tieneSolicitudAprobada = true;
                }
            }
            if (proyectosMap.size === 0) {
                return [];
            }
            const proyectosIds = Array.from(proyectosMap.keys());
            const proyectos = await this.repo.find({
                where: proyectosIds.map(id => ({ id_proyecto: id })),
                relations: ['organizacion', 'estado', 'beneficio', 'fases', 'fases.tareas'],
                order: { creado_en: 'DESC' }
            });
            return proyectos.map(proyecto => {
                const proyectoData = proyectosMap.get(proyecto.id_proyecto);
                if (!proyectoData)
                    return null;
                const rolesIds = Array.from(proyectoData.roles);
                const rolesAsignados = asignaciones
                    .filter(a => {
                    var _a, _b, _c;
                    const proyId = (_c = (_b = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.proyecto) === null || _c === void 0 ? void 0 : _c.id_proyecto;
                    return proyId === proyecto.id_proyecto && a.rol;
                })
                    .map(a => ({
                    id_rol: a.rol.id_rol,
                    nombre: a.rol.nombre,
                    descripcion: a.rol.descripcion,
                    tipo_rol: a.rol.tipo_rol
                }))
                    .filter((rol, index, self) => index === self.findIndex(r => r.id_rol === rol.id_rol));
                return Object.assign(Object.assign({}, proyecto), { rolesAsignados: rolesAsignados, roles: rolesAsignados.length > 0
                        ? rolesAsignados.map(r => r.nombre).join(', ')
                        : 'Voluntario', tieneAsignaciones: proyectoData.tieneAsignaciones || false, tieneSolicitudAprobada: proyectoData.tieneSolicitudAprobada || false });
            }).filter(p => p !== null);
        }
        catch (error) {
            console.error('Error en findProjectsByVoluntario:', error);
            return [];
        }
    }
    async findOneForVolunteer(id_proyecto, id_usuario) {
        const proyecto = await this.findOne(id_proyecto);
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id_proyecto} no encontrado`);
        }
        const voluntario = await this.voluntarioRepo.findOne({ where: { id_usuario } });
        if (!voluntario) {
            throw new common_1.NotFoundException('Voluntario no encontrado');
        }
        const asignaciones = await this.asignacionRepo.find({
            where: { id_voluntario: voluntario.id_voluntario },
            relations: ['tarea', 'tarea.fase', 'tarea.estado', 'rol']
        });
        const asignacionesProyecto = asignaciones.filter(a => { var _a, _b; return ((_b = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.fase) === null || _b === void 0 ? void 0 : _b.id_proyecto) === id_proyecto; });
        const rolesAsignados = asignacionesProyecto
            .map(a => a.rol)
            .filter((rol, index, self) => rol && index === self.findIndex(r => r && r.id_rol === rol.id_rol));
        const horas = await this.horasRepo.find({
            where: {
                id_voluntario: voluntario.id_voluntario,
                id_proyecto: id_proyecto
            },
            relations: ['tarea'],
            order: { fecha: 'DESC', creado_en: 'DESC' }
        });
        const totalHoras = horas.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const horasVerificadas = horas.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const tareasCompletadas = asignacionesProyecto.filter(a => {
            var _a, _b, _c;
            const estado = (_a = a.tarea) === null || _a === void 0 ? void 0 : _a.estado;
            return estado && (((_b = estado.nombre) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('complet')) || ((_c = estado.nombre) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('finaliz')));
        }).length;
        return Object.assign(Object.assign({}, proyecto), { rolesAsignados: rolesAsignados, asignaciones: asignacionesProyecto, horas: horas, resumenHoras: {
                totalHoras: parseFloat(totalHoras.toFixed(2)),
                horasVerificadas: parseFloat(horasVerificadas.toFixed(2)),
                horasPendientes: parseFloat((totalHoras - horasVerificadas).toFixed(2)),
                totalRegistros: horas.length
            }, progresoPersonal: {
                tareasAsignadas: asignacionesProyecto.length,
                tareasCompletadas: tareasCompletadas,
                porcentajeCompletado: asignacionesProyecto.length > 0
                    ? Math.round((tareasCompletadas / asignacionesProyecto.length) * 100)
                    : 0
            } });
    }
};
exports.ProyectoService = ProyectoService;
exports.ProyectoService = ProyectoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proyecto_entity_1.Proyecto)),
    __param(1, (0, typeorm_1.InjectRepository)(organizacion_entity_1.Organizacion)),
    __param(2, (0, typeorm_1.InjectRepository)(fase_entity_1.Fase)),
    __param(3, (0, typeorm_1.InjectRepository)(tarea_entity_1.Tarea)),
    __param(4, (0, typeorm_1.InjectRepository)(proyecto_beneficio_entity_1.ProyectoBeneficio)),
    __param(5, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __param(6, (0, typeorm_1.InjectRepository)(voluntario_entity_1.Voluntario)),
    __param(7, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __param(8, (0, typeorm_1.InjectRepository)(horas_voluntariadas_entity_1.HorasVoluntariadas)),
    __param(9, (0, typeorm_1.InjectRepository)(estado_entity_1.Estado)),
    __param(10, (0, typeorm_1.InjectRepository)(solicitud_inscripcion_entity_1.SolicitudInscripcion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService])
], ProyectoService);
//# sourceMappingURL=proyecto.service.js.map