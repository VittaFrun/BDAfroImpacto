import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { EliminacionHistorialService } from './eliminacion-historial.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';

@Controller('eliminacion-historial')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EliminacionHistorialController {
  constructor(private readonly service: EliminacionHistorialService) {}

  @Get('proyecto/:idProyecto')
  @Roles('organizacion', 'admin')
  findByProyecto(@Param('idProyecto') idProyecto: string) {
    return this.service.findByProyecto(+idProyecto);
  }

  @Get('usuario/mis-eliminaciones')
  @Roles('organizacion', 'admin')
  findByUsuario(@GetUser() user: Usuario) {
    return this.service.findByUsuario(user.id_usuario);
  }

  @Get('tipo/:tipoEntidad')
  @Roles('organizacion', 'admin')
  findByTipoEntidad(
    @Param('tipoEntidad') tipoEntidad: string,
    @Query('idProyecto') idProyecto?: string
  ) {
    return this.service.findByTipoEntidad(tipoEntidad, idProyecto ? +idProyecto : undefined);
  }

  @Get('recientes')
  @Roles('organizacion', 'admin')
  findRecent(@Query('idProyecto') idProyecto?: string) {
    return this.service.findRecent(idProyecto ? +idProyecto : undefined);
  }
}

