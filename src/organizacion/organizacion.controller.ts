import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { OrganizacionService } from './organizacion.service';
import { CreateOrganizacionDto } from './create-organizacion.dto';
import { UpdateOrganizacionDto } from './update-organizacion.dto';

@Controller('organizaciones')
export class OrganizacionController {
  constructor(private readonly service: OrganizacionService) {}

  @Post()
  create(@Body() dto: CreateOrganizacionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizacionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  // Endpoints públicos (sin autenticación requerida)
  @Get('publicas')
  findPublicas() {
    return this.service.findPublicas();
  }

  @Get(':id/publico')
  findPublico(@Param('id', ParseIntPipe) id: number) {
    return this.service.findPublico(id);
  }

  @Get(':id/proyectos-publicos')
  findProyectosPublicos(@Param('id', ParseIntPipe) id: number) {
    return this.service.findProyectosPublicos(id);
  }
}
