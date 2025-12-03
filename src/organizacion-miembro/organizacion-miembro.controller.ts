import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { OrganizacionMiembroService } from './organizacion-miembro.service';
import { CreateOrganizacionMiembroDto } from './create-organizacion-miembro.dto';
import { UpdateOrganizacionMiembroDto } from './update-organizacion-miembro.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';

@Controller('organizaciones/:id/equipo')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrganizacionMiembroController {
  constructor(private readonly service: OrganizacionMiembroService) {}

  @Get()
  @Roles('admin', 'organizacion', 'voluntario')
  findAllByOrganization(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: Usuario
  ) {
    return this.service.findAllByOrganization(id, user);
  }

  @Post('solicitar')
  @Roles('voluntario')
  solicitarUnirse(
    @Param('id', ParseIntPipe) id_organizacion: number,
    @GetUser() user: Usuario
  ) {
    return this.service.solicitarUnirse(id_organizacion, user.id_usuario);
  }

  @Post('aprobar/:miembroId')
  @Roles('admin', 'organizacion')
  aprobarSolicitud(
    @Param('id', ParseIntPipe) id_organizacion: number,
    @Param('miembroId', ParseIntPipe) miembroId: number,
    @Body() body: { id_rol_organizacion?: number },
    @GetUser() user: Usuario
  ) {
    return this.service.aprobarSolicitud(miembroId, body.id_rol_organizacion || null, user);
  }

  @Patch(':miembroId')
  @Roles('admin', 'organizacion')
  update(
    @Param('id', ParseIntPipe) id_organizacion: number,
    @Param('miembroId', ParseIntPipe) miembroId: number,
    @Body() dto: UpdateOrganizacionMiembroDto,
    @GetUser() user: Usuario
  ) {
    return this.service.update(miembroId, dto, user);
  }

  @Delete(':miembroId')
  @Roles('admin', 'organizacion')
  remove(
    @Param('id', ParseIntPipe) id_organizacion: number,
    @Param('miembroId', ParseIntPipe) miembroId: number,
    @GetUser() user: Usuario
  ) {
    return this.service.remove(miembroId, user);
  }
}

