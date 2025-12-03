import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './create-rol.dto';
import { UpdateRolDto } from './update-rol.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RolController {
  constructor(private readonly service: RolService) {}

  @Post()
  @Roles('admin', 'organizacion')
  create(@Body() dto: CreateRolDto, @GetUser() user: Usuario) {
    return this.service.create(dto, user);
  }

  @Get()
  @Roles('admin', 'organizacion', 'voluntario')
  findAll(
    @Query('tipo_rol') tipo_rol?: string,
    @Query('id_organizacion') id_organizacion?: string,
    @Query('id_proyecto') id_proyecto?: string,
  ) {
    const filters: any = {};
    if (tipo_rol) filters.tipo_rol = tipo_rol;
    if (id_organizacion) filters.id_organizacion = parseInt(id_organizacion);
    if (id_proyecto) filters.id_proyecto = parseInt(id_proyecto);
    
    return this.service.findAll(Object.keys(filters).length > 0 ? filters : undefined);
  }

  @Get('organizacion/:id')
  @Roles('admin', 'organizacion', 'voluntario')
  findByOrganization(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByOrganization(id);
  }

  @Get('proyecto/:id')
  @Roles('admin', 'organizacion', 'voluntario')
  findByProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByProject(id);
  }

  @Get(':id')
  @Roles('admin', 'organizacion', 'voluntario')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'organizacion')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolDto,
    @GetUser() user: Usuario
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('admin', 'organizacion')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    return this.service.remove(id, user);
  }

  @Get(':id/permisos')
  @Roles('admin', 'organizacion')
  getPermisos(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPermisos(id);
  }

  @Patch(':id/permisos')
  @Roles('admin', 'organizacion')
  updatePermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permisos: number[] },
    @GetUser() user: Usuario
  ) {
    return this.service.updatePermisos(id, body.permisos || [], user);
  }
}
