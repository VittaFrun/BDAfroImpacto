import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  Response,
  ParseIntPipe,
  BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReporteGeneratorService } from './reporte-generator.service';
import { CreateReporteDto } from './create-reporte.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('reportes')
@UseGuards(AuthGuard('jwt'))
export class ReporteController {
  constructor(
    private readonly reporteService: ReporteGeneratorService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Genera un reporte de forma asíncrona
   */
  @Post('generar')
  async generateReport(@Body() dto: CreateReporteDto, @Request() req) {
    const options = {
      incluirGraficos: dto.incluir_graficos,
      incluirDetalles: dto.incluir_detalles,
      incluirHoras: dto.incluir_horas,
      incluirVoluntarios: dto.incluir_voluntarios,
      fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
      fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
      formato: dto.formato,
      plantilla: dto.plantilla
    };

    return await this.reporteService.generateReportAsync(
      dto.id_proyecto,
      dto.tipo,
      dto.formato,
      options,
      req.user
    );
  }

  /**
   * Genera un reporte simple de forma síncrona
   */
  @Post('generar-simple')
  async generateSimpleReport(@Body() dto: CreateReporteDto, @Request() req, @Response() res) {
    if (dto.formato === 'PDF' && dto.incluir_graficos) {
      throw new BadRequestException('Los reportes PDF con gráficos deben generarse de forma asíncrona');
    }

    const options = {
      incluirGraficos: false, // Forzar false para reportes síncronos
      incluirDetalles: dto.incluir_detalles,
      incluirHoras: dto.incluir_horas,
      incluirVoluntarios: dto.incluir_voluntarios,
      fechaInicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
      fechaFin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
      formato: dto.formato,
      plantilla: dto.plantilla
    };

    const buffer = await this.reporteService.generateReportSync(
      dto.id_proyecto,
      dto.tipo,
      dto.formato,
      options,
      req.user
    );

    // Configurar headers para descarga
    const fileName = `reporte_${dto.tipo}_${Date.now()}.${dto.formato.toLowerCase()}`;
    const mimeTypes = {
      'PDF': 'application/pdf',
      'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'CSV': 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[dto.formato]);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  /**
   * Obtiene el estado de un reporte
   */
  @Get(':id/estado')
  async getReportStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.reporteService.getReportStatus(id);
  }

  /**
   * Descarga un reporte generado
   */
  @Get(':id/descargar')
  async downloadReport(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req, 
    @Response() res
  ) {
    const buffer = await this.reporteService.downloadReport(id, req.user);
    const reporte = await this.reporteService.getReportStatus(id);

    const fileName = `reporte_${reporte.tipo}_${reporte.id_reporte}.${reporte.formato.toLowerCase()}`;
    const mimeTypes = {
      'PDF': 'application/pdf',
      'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'CSV': 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[reporte.formato]);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  /**
   * Obtiene analytics generales de proyectos
   */
  @Get('analytics/proyectos')
  async getProjectAnalytics() {
    return await this.analyticsService.getProjectAnalytics();
  }

  /**
   * Obtiene analytics de una organización específica
   */
  @Get('analytics/organizacion/:id')
  async getOrganizationAnalytics(@Param('id', ParseIntPipe) id: number) {
    return await this.analyticsService.getOrganizationAnalytics(id);
  }

  /**
   * Obtiene analytics de un voluntario específico
   */
  @Get('analytics/voluntario/:id')
  async getVolunteerAnalytics(@Param('id', ParseIntPipe) id: number) {
    return await this.analyticsService.getVolunteerAnalytics(id);
  }

  /**
   * Obtiene lista de reportes de un proyecto
   */
  @Get('proyecto/:id')
  async getProjectReports(@Param('id', ParseIntPipe) projectId: number, @Request() req) {
    // Validar acceso al proyecto
    await this.reporteService['validateProjectAccess'](projectId, req.user);
    
    // Aquí podrías implementar la lógica para obtener reportes del proyecto
    return { message: 'Lista de reportes del proyecto', projectId };
  }
}