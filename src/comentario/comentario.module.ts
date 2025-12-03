import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentarioService } from './comentario.service';
import { ComentarioController } from './comentario.controller';
import { Comentario } from './comentario.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Fase } from '../fase/fase.entity';
import { Usuario } from '../users/user.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comentario, Tarea, Proyecto, Fase, Usuario]),
    NotificacionModule,
  ],
  controllers: [ComentarioController],
  providers: [ComentarioService],
  exports: [ComentarioService],
})
export class ComentarioModule {}

