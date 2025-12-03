import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizacion } from './organizacion.entity';
import { OrganizacionService } from './organizacion.service';
import { OrganizacionController } from './organizacion.controller';
import { Usuario } from '../users/user.entity';
import { Proyecto } from '../proyecto/proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizacion, Usuario, Proyecto])],
  controllers: [OrganizacionController],
  providers: [OrganizacionService],
  exports: [OrganizacionService],
})
export class OrganizacionModule {}
