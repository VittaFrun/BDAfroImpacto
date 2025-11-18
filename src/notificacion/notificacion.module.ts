import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './notificacion.entity';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Usuario, Proyecto])],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}

