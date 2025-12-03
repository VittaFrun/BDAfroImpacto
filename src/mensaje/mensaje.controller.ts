import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Usuario } from '../users/user.entity';
import { MensajeService } from './mensaje.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Controller('mensajes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  @Post()
  async crearMensaje(
    @Body() createMensajeDto: CreateMensajeDto,
    @GetUser() user: Usuario,
  ) {
    return this.mensajeService.crearMensaje(createMensajeDto, user.id_usuario);
  }

  @Get('conversaciones')
  async obtenerConversaciones(@GetUser() user: Usuario) {
    return this.mensajeService.obtenerConversaciones(user.id_usuario);
  }

  @Get('conversaciones/:idConversacion')
  async obtenerMensajes(
    @Param('idConversacion', ParseIntPipe) idConversacion: number,
    @GetUser() user: Usuario,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.mensajeService.obtenerMensajes(
      idConversacion,
      user.id_usuario,
      limit ? parseInt(limit.toString()) : 50,
      beforeDate,
    );
  }

  @Patch(':id/leido')
  async marcarComoLeido(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: Usuario,
  ) {
    await this.mensajeService.marcarComoLeido(id, user.id_usuario);
    return { success: true };
  }

  @Delete(':id')
  async eliminarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: Usuario,
  ) {
    await this.mensajeService.eliminarMensaje(id, user.id_usuario);
    return { success: true };
  }

  @Get('no-leidos/contar')
  async contarNoLeidos(@GetUser() user: Usuario) {
    const count = await this.mensajeService.contarMensajesNoLeidos(user.id_usuario);
    return { count };
  }
}

