import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';

@Controller('notificacion')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificacionController {
  constructor(private readonly service: NotificacionService) {}

  @Get('mis-notificaciones')
  @Roles('organizacion', 'voluntario', 'admin')
  getMisNotificaciones(
    @GetUser() user: Usuario,
    @Query('soloNoLeidas') soloNoLeidas?: string
  ) {
    return this.service.findByUsuario(
      user.id_usuario,
      soloNoLeidas === 'true'
    );
  }

  @Get('contar-no-leidas')
  @Roles('organizacion', 'voluntario', 'admin')
  contarNoLeidas(@GetUser() user: Usuario) {
    return this.service.contarNoLeidas(user.id_usuario);
  }

  @Patch(':id/leida')
  @Roles('organizacion', 'voluntario', 'admin')
  marcarComoLeida(
    @Param('id') id: string,
    @GetUser() user: Usuario
  ) {
    return this.service.marcarComoLeida(+id, user.id_usuario);
  }

  @Patch('marcar-todas-leidas')
  @Roles('organizacion', 'voluntario', 'admin')
  marcarTodasComoLeidas(@GetUser() user: Usuario) {
    return this.service.marcarTodasComoLeidas(user.id_usuario);
  }

  @Post()
  @Roles('organizacion', 'admin')
  crear(@Body() dto: any) {
    return this.service.crear(dto);
  }

  @Delete(':id')
  @Roles('organizacion', 'voluntario', 'admin')
  eliminar(
    @Param('id') id: string,
    @GetUser() user: Usuario
  ) {
    return this.service.eliminar(+id, user.id_usuario);
  }
}

