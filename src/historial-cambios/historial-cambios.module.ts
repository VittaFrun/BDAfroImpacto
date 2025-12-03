import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialCambiosService } from './historial-cambios.service';
import { HistorialCambiosController } from './historial-cambios.controller';
import { HistorialCambios } from './historial-cambios.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialCambios]),
  ],
  controllers: [HistorialCambiosController],
  providers: [HistorialCambiosService],
  exports: [HistorialCambiosService],
})
export class HistorialCambiosModule {}
