"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const proyecto_module_1 = require("./proyecto/proyecto.module");
const auth_module_1 = require("./auth/auth.module");
const rol_module_1 = require("./rol/rol.module");
const permiso_module_1 = require("./permiso/permiso.module");
const disponibilidad_module_1 = require("./disponibilidad/disponibilidad.module");
const metodopago_module_1 = require("./metodopago/metodopago.module");
const evaluacion_module_1 = require("./evaluacion/evaluacion.module");
const archivo_module_1 = require("./archivo/archivo.module");
const donacion_module_1 = require("./donacion/donacion.module");
const organizacion_module_1 = require("./organizacion/organizacion.module");
const voluntario_module_1 = require("./voluntario/voluntario.module");
const asignacion_module_1 = require("./asignacion/asignacion.module");
const tarea_module_1 = require("./tarea/tarea.module");
const movimiento_module_1 = require("./movimiento/movimiento.module");
const donacion_proyecto_module_1 = require("./donacion-proyecto/donacion-proyecto.module");
const reporte_module_1 = require("./reporte/reporte.module");
const jornada_module_1 = require("./jornada/jornada.module");
const voluntario_habilidad_module_1 = require("./voluntario-habilidad/voluntario-habilidad.module");
const habilidad_module_1 = require("./habilidad/habilidad.module");
const fase_module_1 = require("./fase/fase.module");
const estado_module_1 = require("./estado/estado.module");
const proyecto_beneficio_module_1 = require("./proyecto-beneficio/proyecto-beneficio.module");
const solicitud_inscripcion_module_1 = require("./solicitud-inscripcion/solicitud-inscripcion.module");
const formulario_inscripcion_module_1 = require("./formulario-inscripcion/formulario-inscripcion.module");
const documento_solicitud_module_1 = require("./documento-solicitud/documento-solicitud.module");
const horas_voluntariadas_module_1 = require("./horas-voluntariadas/horas-voluntariadas.module");
const eliminacion_historial_module_1 = require("./eliminacion-historial/eliminacion-historial.module");
const notificacion_module_1 = require("./notificacion/notificacion.module");
const certificado_module_1 = require("./certificado/certificado.module");
const logro_module_1 = require("./logro/logro.module");
const voluntario_logro_module_1 = require("./voluntario-logro/voluntario-logro.module");
const mensaje_module_1 = require("./mensaje/mensaje.module");
const organizacion_miembro_module_1 = require("./organizacion-miembro/organizacion-miembro.module");
const comentario_module_1 = require("./comentario/comentario.module");
const analytics_module_1 = require("./analytics/analytics.module");
const historial_cambios_module_1 = require("./historial-cambios/historial-cambios.module");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT) || 6379,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'mysql',
                    host: config.get('DB_HOST'),
                    port: config.get('DB_PORT'),
                    username: config.get('DB_USERNAME'),
                    password: config.get('DB_PASSWORD'),
                    database: config.get('DB_DATABASE'),
                    autoLoadEntities: true,
                    synchronize: false,
                }),
            }),
            users_module_1.UsersModule,
            proyecto_module_1.ProyectoModule,
            auth_module_1.AuthModule,
            rol_module_1.RolModule,
            permiso_module_1.PermisoModule,
            disponibilidad_module_1.DisponibilidadModule,
            metodopago_module_1.MetodoPagoModule,
            evaluacion_module_1.EvaluacionModule,
            archivo_module_1.ArchivoModule,
            donacion_module_1.DonacionModule,
            organizacion_module_1.OrganizacionModule,
            voluntario_module_1.VoluntarioModule,
            asignacion_module_1.AsignacionModule,
            tarea_module_1.TareaModule,
            movimiento_module_1.MovimientoModule,
            donacion_proyecto_module_1.DonacionProyectoModule,
            reporte_module_1.ReporteModule,
            jornada_module_1.JornadaModule,
            voluntario_habilidad_module_1.VoluntarioHabilidadModule,
            habilidad_module_1.HabilidadModule,
            fase_module_1.FaseModule,
            estado_module_1.EstadoModule,
            proyecto_beneficio_module_1.ProyectoBeneficioModule,
            documento_solicitud_module_1.DocumentoSolicitudModule,
            solicitud_inscripcion_module_1.SolicitudInscripcionModule,
            formulario_inscripcion_module_1.FormularioInscripcionModule,
            horas_voluntariadas_module_1.HorasVoluntariadasModule,
            eliminacion_historial_module_1.EliminacionHistorialModule,
            notificacion_module_1.NotificacionModule,
            certificado_module_1.CertificadoModule,
            logro_module_1.LogroModule,
            voluntario_logro_module_1.VoluntarioLogroModule,
            mensaje_module_1.MensajeModule,
            organizacion_miembro_module_1.OrganizacionMiembroModule,
            comentario_module_1.ComentarioModule,
            analytics_module_1.AnalyticsModule,
            historial_cambios_module_1.HistorialCambiosModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map