import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionMiembro } from './organizacion-miembro.entity';
import { OrganizacionMiembroService } from './organizacion-miembro.service';
import { OrganizacionMiembroController } from './organizacion-miembro.controller';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizacionMiembro, Organizacion, Voluntario, Rol])
  ],
  controllers: [OrganizacionMiembroController],
  providers: [OrganizacionMiembroService],
  exports: [OrganizacionMiembroService]
})
export class OrganizacionMiembroModule {}

