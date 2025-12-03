import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fase } from './fase.entity';
import { FaseService } from './fase.service';
import { FaseController } from './fase.controller';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fase, Proyecto, Tarea])],
  controllers: [FaseController],
  providers: [FaseService],
})
export class FaseModule {}
