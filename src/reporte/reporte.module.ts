import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ReporteController } from './reporte.controller';
import { ReporteGeneratorService } from './reporte-generator.service';
import { ReporteProcessor } from './reporte-processor';
import { Reporte } from './reporte.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Fase } from '../fase/fase.entity';
import { Usuario } from '../users/user.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { Voluntario } from '../voluntario/voluntario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reporte,
      Proyecto,
      HorasVoluntariadas,
      Asignacion,
      Tarea,
      Fase,
      Usuario,
      Voluntario
    ]),
    BullModule.registerQueue({
      name: 'reportes',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [ReporteController],
  providers: [ReporteGeneratorService, ReporteProcessor, AnalyticsService],
  exports: [ReporteGeneratorService, AnalyticsService],
})
export class ReporteModule {}