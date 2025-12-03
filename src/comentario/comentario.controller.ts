import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './create-comentario.dto';
import { UpdateComentarioDto } from './update-comentario.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';

@Controller('comentario')
@UseGuards(AuthGuard('jwt'))
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
  create(@Body() createComentarioDto: CreateComentarioDto, @GetUser() user: Usuario) {
    return this.comentarioService.create(createComentarioDto, user.id_usuario);
  }

  @Get()
  findAll(
    @Query('tipo') tipoEntidad: string,
    @Query('entidad', ParseIntPipe) idEntidad: number,
    @Query('includeRespuestas') includeRespuestas?: string,
  ) {
    return this.comentarioService.findAll(
      tipoEntidad,
      idEntidad,
      includeRespuestas !== 'false',
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comentarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComentarioDto: UpdateComentarioDto,
    @GetUser() user: Usuario,
  ) {
    return this.comentarioService.update(id, updateComentarioDto, user.id_usuario);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
    return this.comentarioService.remove(id, user.id_usuario);
  }
}

