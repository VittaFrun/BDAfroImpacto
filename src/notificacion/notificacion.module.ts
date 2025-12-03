import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Notificacion } from './notificacion.entity';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { RecordatoriosService } from './recordatorios.service';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Usuario, Proyecto, Tarea, Asignacion, Organizacion, Voluntario]),
    ScheduleModule.forRoot()
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService, RecordatoriosService],
  exports: [NotificacionService],
})
export class NotificacionModule {}

