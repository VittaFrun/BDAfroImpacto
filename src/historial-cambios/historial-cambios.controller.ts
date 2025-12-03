import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistorialCambiosService } from './historial-cambios.service';

@Controller('historial')
@UseGuards(AuthGuard('jwt'))
export class HistorialCambiosController {
  constructor(
    private readonly historialService: HistorialCambiosService,
  ) {}

  /**
   * Obtiene el historial de una entidad específica
   */
  @Get('entidad/:tipo/:id')
  async getEntityHistory(
    @Param('tipo') tipo: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('limite') limite?: string
  ) {
    const limiteNum = limite ? parseInt(limite) : 50;
    return await this.historialService.obtenerHistorialEntidad(tipo, id, limiteNum);
  }

  /**
   * Obtiene el historial completo de un proyecto
   */
  @Get('proyecto/:id')
  async getProjectHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('limite') limite?: string
  ) {
    const limiteNum = limite ? parseInt(limite) : 100;
    return await this.historialService.obtenerHistorialProyecto(id, limiteNum);
  }

  /**
   * Obtiene estadísticas del historial
   */
  @Get('estadisticas')
  async getHistoryStats(@Query('proyecto') proyecto?: string) {
    const proyectoId = proyecto ? parseInt(proyecto) : undefined;
    return await this.historialService.obtenerEstadisticasHistorial(proyectoId);
  }

  /**
   * Restaura una entidad a una versión anterior
   */
  @Post('restaurar')
  async restoreVersion(
    @Body() body: {
      tipo_entidad: string;
      id_entidad: number;
      id_historial: number;
    },
    @Request() req
  ) {
    return await this.historialService.restaurarVersion(
      body.tipo_entidad,
      body.id_entidad,
      body.id_historial,
      req.user
    );
  }
}
