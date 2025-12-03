import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogroService } from './logro.service';
import { LogroController } from './logro.controller';
import { Logro } from './logro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Logro])],
  controllers: [LogroController],
  providers: [LogroService],
  exports: [LogroService],
})
export class LogroModule {}

