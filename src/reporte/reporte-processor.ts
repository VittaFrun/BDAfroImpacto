import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { Reporte } from './reporte.entity';
import { ReporteGeneratorService } from './reporte-generator.service';
import { Usuario } from '../users/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Processor('reportes')
@Injectable()
export class ReporteProcessor {
  private readonly logger = new Logger(ReporteProcessor.name);

  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepo: Repository<Reporte>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly reporteGenerator: ReporteGeneratorService,
  ) {}

  @Process('generate-report')
  async handleReportGeneration(job: Job) {
    const { reporteId, projectId, tipo, formato, options, userId } = job.data;
    
    this.logger.log(`Iniciando generación de reporte ${reporteId} para proyecto ${projectId}`);

    try {
      // Actualizar estado a "generando"
      await this.reporteRepo.update(reporteId, {
        estado: 'generando',
        actualizado_en: new Date()
      });

      // Obtener usuario
      const user = await this.usuarioRepo.findOne({
        where: { id_usuario: userId }
      });

      if (!user) {
        throw new Error(`Usuario con ID ${userId} no encontrado`);
      }

      // Generar el reporte
      const reportBuffer = await this.reporteGenerator.generateReportSync(
        projectId,
        tipo,
        formato,
        options,
        user
      );

      // Guardar archivo en el sistema de archivos
      const fileName = `reporte_${reporteId}_${Date.now()}.${formato.toLowerCase()}`;
      const filePath = await this.saveReportFile(fileName, reportBuffer);

      // Actualizar registro con éxito
      await this.reporteRepo.update(reporteId, {
        estado: 'listo',
        contenido: filePath,
        actualizado_en: new Date()
      });

      this.logger.log(`Reporte ${reporteId} generado exitosamente`);

      // Aquí podrías enviar una notificación al usuario
      // await this.notificationService.notifyReportReady(userId, reporteId);

    } catch (error) {
      this.logger.error(`Error generando reporte ${reporteId}:`, error);

      // Actualizar estado a error
      await this.reporteRepo.update(reporteId, {
        estado: 'error',
        contenido: error.message,
        actualizado_en: new Date()
      });

      throw error;
    }
  }

  /**
   * Guarda el archivo del reporte en el sistema de archivos
   */
  private async saveReportFile(fileName: string, buffer: Buffer): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'reportes');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return filePath;
  }
}
