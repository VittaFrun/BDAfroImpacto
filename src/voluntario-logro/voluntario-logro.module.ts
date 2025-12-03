import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoluntarioLogroService } from './voluntario-logro.service';
import { VoluntarioLogroController } from './voluntario-logro.controller';
import { VoluntarioLogro } from './voluntario-logro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoluntarioLogro])],
  controllers: [VoluntarioLogroController],
  providers: [VoluntarioLogroService],
  exports: [VoluntarioLogroService],
})
export class VoluntarioLogroModule {}

