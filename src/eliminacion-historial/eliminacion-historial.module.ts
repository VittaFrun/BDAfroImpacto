import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EliminacionHistorial } from './eliminacion-historial.entity';
import { EliminacionHistorialService } from './eliminacion-historial.service';
import { EliminacionHistorialController } from './eliminacion-historial.controller';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EliminacionHistorial, Usuario, Proyecto])],
  controllers: [EliminacionHistorialController],
  providers: [EliminacionHistorialService],
  exports: [EliminacionHistorialService],
})
export class EliminacionHistorialModule {}

