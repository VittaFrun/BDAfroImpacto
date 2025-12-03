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
exports.HistorialCambiosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const historial_cambios_entity_1 = require("./historial-cambios.entity");
let HistorialCambiosService = class HistorialCambiosService {
    constructor(historialRepo) {
        this.historialRepo = historialRepo;
    }
    async registrarCambio(cambio, usuario) {
        const campos_modificados = this.detectarCamposModificados(cambio.datos_anteriores, cambio.datos_nuevos);
        const historial = this.historialRepo.create({
            tipo_entidad: cambio.tipo_entidad,
            id_entidad: cambio.id_entidad,
            accion: cambio.accion,
            datos_anteriores: cambio.datos_anteriores,
            datos_nuevos: cambio.datos_nuevos,
            campos_modificados,
            descripcion: cambio.descripcion || this.generarDescripcionAutomatica(cambio, campos_modificados),
            direccion_ip: cambio.direccion_ip,
            user_agent: cambio.user_agent,
            id_usuario: usuario.id_usuario
        });
        return await this.historialRepo.save(historial);
    }
    async obtenerHistorialEntidad(tipo_entidad, id_entidad, limite = 50) {
        return await this.historialRepo.find({
            where: { tipo_entidad: tipo_entidad, id_entidad },
            relations: ['usuario'],
            order: { creado_en: 'DESC' },
            take: limite
        });
    }
    async obtenerHistorialProyecto(id_proyecto, limite = 100) {
        const cambiosProyecto = await this.historialRepo.find({
            where: { tipo_entidad: 'proyecto', id_entidad: id_proyecto },
            relations: ['usuario'],
            order: { creado_en: 'DESC' }
        });
        const fases = await this.historialRepo.manager.query(`
      SELECT f.id_fase 
      FROM fase f 
      WHERE f.id_proyecto = ?
    `, [id_proyecto]);
        const cambiosFases = [];
        for (const fase of fases) {
            const cambios = await this.historialRepo.find({
                where: { tipo_entidad: 'fase', id_entidad: fase.id_fase },
                relations: ['usuario'],
                order: { creado_en: 'DESC' }
            });
            cambiosFases.push(...cambios);
        }
        const tareas = await this.historialRepo.manager.query(`
      SELECT t.id_tarea 
      FROM tarea t 
      INNER JOIN fase f ON t.id_fase = f.id_fase 
      WHERE f.id_proyecto = ?
    `, [id_proyecto]);
        const cambiosTareas = [];
        for (const tarea of tareas) {
            const cambios = await this.historialRepo.find({
                where: { tipo_entidad: 'tarea', id_entidad: tarea.id_tarea },
                relations: ['usuario'],
                order: { creado_en: 'DESC' }
            });
            cambiosTareas.push(...cambios);
        }
        const todosCambios = [...cambiosProyecto, ...cambiosFases, ...cambiosTareas]
            .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
            .slice(0, limite);
        return todosCambios.map(cambio => (Object.assign(Object.assign({}, cambio), { entidad_nombre: this.obtenerNombreEntidad(cambio.tipo_entidad, cambio.datos_nuevos || cambio.datos_anteriores) })));
    }
    async obtenerEstadisticasHistorial(id_proyecto) {
        let whereClause = '';
        let params = [];
        if (id_proyecto) {
            whereClause = `
        WHERE (
          (h.tipo_entidad = 'proyecto' AND h.id_entidad = ?) OR
          (h.tipo_entidad = 'fase' AND h.id_entidad IN (
            SELECT f.id_fase FROM fase f WHERE f.id_proyecto = ?
          )) OR
          (h.tipo_entidad = 'tarea' AND h.id_entidad IN (
            SELECT t.id_tarea FROM tarea t 
            INNER JOIN fase f ON t.id_fase = f.id_fase 
            WHERE f.id_proyecto = ?
          ))
        )
      `;
            params = [id_proyecto, id_proyecto, id_proyecto];
        }
        const estadisticas = await this.historialRepo.manager.query(`
      SELECT 
        h.tipo_entidad,
        h.accion,
        COUNT(*) as total,
        DATE(h.creado_en) as fecha
      FROM historial_cambios h
      ${whereClause}
      GROUP BY h.tipo_entidad, h.accion, DATE(h.creado_en)
      ORDER BY fecha DESC
      LIMIT 30
    `, params);
        const resumen = await this.historialRepo.manager.query(`
      SELECT 
        COUNT(*) as total_cambios,
        COUNT(DISTINCT h.id_usuario) as usuarios_activos,
        COUNT(DISTINCT DATE(h.creado_en)) as dias_con_actividad
      FROM historial_cambios h
      ${whereClause}
      WHERE h.creado_en >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, params);
        return {
            resumen: resumen[0],
            actividad_diaria: estadisticas
        };
    }
    async restaurarVersion(tipo_entidad, id_entidad, id_historial, usuario) {
        const cambio = await this.historialRepo.findOne({
            where: { id_historial }
        });
        if (!cambio) {
            throw new Error('Cambio no encontrado en el historial');
        }
        if (cambio.tipo_entidad !== tipo_entidad || cambio.id_entidad !== id_entidad) {
            throw new Error('El cambio no corresponde a la entidad especificada');
        }
        if (tipo_entidad === 'proyecto') {
            await this.restaurarProyecto(id_entidad, cambio.datos_anteriores, usuario);
        }
        await this.registrarCambio({
            tipo_entidad: tipo_entidad,
            id_entidad,
            accion: 'restaurar',
            datos_anteriores: cambio.datos_nuevos,
            datos_nuevos: cambio.datos_anteriores,
            descripcion: `Restaurado a la versión del ${cambio.creado_en.toLocaleString()}`
        }, usuario);
        return { message: 'Versión restaurada exitosamente' };
    }
    detectarCamposModificados(datosAnteriores, datosNuevos) {
        if (!datosAnteriores || !datosNuevos)
            return [];
        const campos = [];
        const todasLasClaves = new Set([
            ...Object.keys(datosAnteriores),
            ...Object.keys(datosNuevos)
        ]);
        for (const clave of todasLasClaves) {
            if (datosAnteriores[clave] !== datosNuevos[clave]) {
                campos.push(clave);
            }
        }
        return campos;
    }
    generarDescripcionAutomatica(cambio, campos_modificados) {
        const entidad = cambio.tipo_entidad;
        const accion = cambio.accion;
        switch (accion) {
            case 'crear':
                return `Se creó un nuevo ${entidad}`;
            case 'eliminar':
                return `Se eliminó el ${entidad}`;
            case 'actualizar':
                if (campos_modificados.length === 0)
                    return `Se actualizó el ${entidad}`;
                return `Se actualizó el ${entidad}: ${campos_modificados.join(', ')}`;
            case 'restaurar':
                return `Se restauró el ${entidad} a una versión anterior`;
            default:
                return `Se modificó el ${entidad}`;
        }
    }
    obtenerNombreEntidad(tipo_entidad, datos) {
        if (!datos)
            return `${tipo_entidad} desconocido`;
        switch (tipo_entidad) {
            case 'proyecto':
                return datos.nombre || `Proyecto ${datos.id_proyecto || ''}`;
            case 'tarea':
                return datos.descripcion || `Tarea ${datos.id_tarea || ''}`;
            case 'fase':
                return datos.nombre || `Fase ${datos.id_fase || ''}`;
            case 'voluntario':
                return datos.nombre || `Voluntario ${datos.id_voluntario || ''}`;
            case 'organizacion':
                return datos.nombre || `Organización ${datos.id_organizacion || ''}`;
            default:
                return `${tipo_entidad} ${datos.id || ''}`;
        }
    }
    async restaurarProyecto(id_proyecto, datosAnteriores, usuario) {
        console.log(`Restaurando proyecto ${id_proyecto} para usuario ${usuario.id_usuario}`);
    }
};
exports.HistorialCambiosService = HistorialCambiosService;
exports.HistorialCambiosService = HistorialCambiosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(historial_cambios_entity_1.HistorialCambios)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HistorialCambiosService);
//# sourceMappingURL=historial-cambios.service.js.map