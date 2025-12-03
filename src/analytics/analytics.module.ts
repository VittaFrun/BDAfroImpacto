import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Fase } from '../fase/fase.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proyecto,
      Tarea,
      Fase,
      HorasVoluntariadas,
      Asignacion,
      Voluntario
    ]),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
