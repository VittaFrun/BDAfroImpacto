import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FaseService } from './fase.service';
import { CreateFaseDto } from './create-fase.dto';
import { UpdateFaseDto } from './update-fase.dto';

@Controller('fase')
export class FaseController {
  constructor(private readonly service: FaseService) {}

  @Post()
  create(@Body() dto: CreateFaseDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateFaseDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post('proyecto/:projectId/reorder')
  reorderPhases(
    @Param('projectId') projectId: string,
    @Body() newOrder: { id_fase: number; orden: number }[]
  ) {
    return this.service.reorderPhases(+projectId, newOrder);
  }
}
