import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './users/user.entity';
import { Rol } from './rol/rol.entity';

// 👇 Asegúrate de importar tu módulo correctamente
import { UsersModule } from './users/users.module'; 
import { ProyectoModule } from './proyecto/proyecto.module';
import { AuthModule } from './auth/auth.module';
import { RolModule } from './rol/rol.module'; 
import { PermisoModule } from './permiso/permiso.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { MetodoPagoModule } from './metodopago/metodopago.module';
import { EvaluacionModule } from './evaluacion/evaluacion.module';
import { ArchivoModule } from './archivo/archivo.module';
import { DonacionModule } from './donacion/donacion.module';
import { OrganizacionModule } from './organizacion/organizacion.module';
import { VoluntarioModule } from './voluntario/voluntario.module';
import { AsignacionModule } from './asignacion/asignacion.module';
import { TareaModule } from './tarea/tarea.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { DonacionProyectoModule } from './donacion-proyecto/donacion-proyecto.module';
import { ReporteModule } from './reporte/reporte.module';
import { JornadaModule } from './jornada/jornada.module';
import { VoluntarioHabilidadModule } from './voluntario-habilidad/voluntario-habilidad.module';
import { HabilidadModule } from './habilidad/habilidad.module';
import { FaseModule } from './fase/fase.module';
import { EstadoModule } from './estado/estado.module';
import { ProyectoBeneficioModule } from './proyecto-beneficio/proyecto-beneficio.module';
import { SolicitudInscripcionModule } from './solicitud-inscripcion/solicitud-inscripcion.module';
import { FormularioInscripcionModule } from './formulario-inscripcion/formulario-inscripcion.module';
import { DocumentoSolicitudModule } from './documento-solicitud/documento-solicitud.module';
import { HorasVoluntariadasModule } from './horas-voluntariadas/horas-voluntariadas.module';
import { EliminacionHistorialModule } from './eliminacion-historial/eliminacion-historial.module';
import { NotificacionModule } from './notificacion/notificacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        // Con autoLoadEntities no es necesario declarar entidades manualmente
        synchronize: false,
      }),
    }),
    // 👇 Aquí agregas tu módulo
    UsersModule,
    ProyectoModule,
    AuthModule,
    RolModule,
    PermisoModule,
    DisponibilidadModule,
    MetodoPagoModule,
    EvaluacionModule,
    ArchivoModule,
    DonacionModule,
    OrganizacionModule,
    VoluntarioModule,
    AsignacionModule,
    TareaModule,
    MovimientoModule,
    DonacionProyectoModule,
    ReporteModule,
    JornadaModule,
    VoluntarioHabilidadModule,
    HabilidadModule,
    FaseModule,
    EstadoModule,
    ProyectoBeneficioModule,
    DocumentoSolicitudModule,
    SolicitudInscripcionModule,
    FormularioInscripcionModule,
    HorasVoluntariadasModule,
    EliminacionHistorialModule,
    NotificacionModule,
  ],
})
export class AppModule {}
