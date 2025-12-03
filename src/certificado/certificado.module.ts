import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';
import { Certificado } from './certificado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado])],
  controllers: [CertificadoController],
  providers: [CertificadoService],
  exports: [CertificadoService],
})
export class CertificadoModule {}

