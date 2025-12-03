import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from './proyecto.entity';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Fase } from '../fase/fase.entity';
import { Tarea } from '../tarea/tarea.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Certificado } from '../certificado/certificado.entity';
import { ProyectoBeneficio } from '../proyecto-beneficio/proyecto-beneficio.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { Estado } from '../estado/estado.entity';
import { SolicitudInscripcion } from '../solicitud-inscripcion/solicitud-inscripcion.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Organizacion, Fase, Tarea, HorasVoluntariadas, Certificado, ProyectoBeneficio, Asignacion, Voluntario, Rol, Estado, SolicitudInscripcion]),
    NotificacionModule
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
  exports: [ProyectoService],
})
export class ProyectoModule {}
