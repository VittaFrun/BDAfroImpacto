import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as XLSX from 'xlsx';
import * as puppeteer from 'puppeteer';
import { Reporte } from './reporte.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Usuario } from '../users/user.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Fase } from '../fase/fase.entity';

export interface ReportData {
  proyecto: any;
  fases: any[];
  tareas: any[];
  voluntarios: any[];
  horas: any[];
  asignaciones: any[];
  estadisticas: any;
  fechaGeneracion: Date;
}

export interface ReportOptions {
  incluirGraficos?: boolean;
  incluirDetalles?: boolean;
  incluirHoras?: boolean;
  incluirVoluntarios?: boolean;
  fechaInicio?: Date;
  fechaFin?: Date;
  formato?: 'PDF' | 'Excel' | 'CSV';
  plantilla?: string;
}

@Injectable()
export class ReporteGeneratorService {
  constructor(
    @InjectRepository(Reporte)
    private readonly reporteRepo: Repository<Reporte>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,
    @InjectRepository(HorasVoluntariadas)
    private readonly horasRepo: Repository<HorasVoluntariadas>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,
    @InjectQueue('reportes') private readonly reporteQueue: Queue,
  ) {}

  /**
   * Genera un reporte de forma asíncrona
   */
  async generateReportAsync(
    projectId: number,
    tipo: string,
    formato: 'PDF' | 'Excel' | 'CSV',
    options: ReportOptions,
    user: Usuario
  ): Promise<Reporte> {
    // Validar que el proyecto existe y el usuario tiene permisos
    const proyecto = await this.validateProjectAccess(projectId, user);

    // Crear registro de reporte
    const reporte = this.reporteRepo.create({
      tipo,
      formato,
      id_proyecto: projectId,
      estado: 'pendiente',
      incluir_graficos: options.incluirGraficos || false,
      creado_en: new Date(),
      actualizado_en: new Date()
    });

    const savedReporte = await this.reporteRepo.save(reporte);

    // Agregar trabajo a la cola
    await this.reporteQueue.add('generate-report', {
      reporteId: savedReporte.id_reporte,
      projectId,
      tipo,
      formato,
      options,
      userId: user.id_usuario
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return savedReporte;
  }

  /**
   * Genera un reporte de forma síncrona (para reportes pequeños)
   */
  async generateReportSync(
    projectId: number,
    tipo: string,
    formato: 'PDF' | 'Excel' | 'CSV',
    options: ReportOptions,
    user: Usuario
  ): Promise<Buffer> {
    const proyecto = await this.validateProjectAccess(projectId, user);
    const data = await this.collectReportData(projectId, options);

    switch (formato) {
      case 'PDF':
        return await this.generatePDF(data, options);
      case 'Excel':
        return await this.generateExcel(data, options);
      case 'CSV':
        return await this.generateCSV(data, options);
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  /**
   * Recolecta todos los datos necesarios para el reporte
   */
  async collectReportData(projectId: number, options: ReportOptions): Promise<ReportData> {
    const proyecto = await this.proyectoRepo.findOne({
      where: { id_proyecto: projectId },
      relations: ['organizacion', 'estado']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }

    // Obtener fases del proyecto
    const fases = await this.faseRepo.find({
      where: { id_proyecto: projectId },
      order: { orden: 'ASC' }
    });

    // Obtener tareas con sus relaciones
    const tareas = await this.tareaRepo
      .createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.fase', 'fase')
      .leftJoinAndSelect('tarea.estado', 'estado')
      .leftJoinAndSelect('tarea.asignaciones', 'asignaciones')
      .leftJoinAndSelect('asignaciones.voluntario', 'voluntario')
      .leftJoinAndSelect('asignaciones.rol', 'rol')
      .leftJoinAndSelect('voluntario.usuario', 'usuario')
      .where('fase.id_proyecto = :projectId', { projectId })
      .orderBy('fase.orden', 'ASC')
      .addOrderBy('tarea.fecha_inicio', 'ASC')
      .getMany();

    // Obtener asignaciones
    const asignaciones = await this.asignacionRepo
      .createQueryBuilder('asignacion')
      .leftJoinAndSelect('asignacion.tarea', 'tarea')
      .leftJoinAndSelect('asignacion.voluntario', 'voluntario')
      .leftJoinAndSelect('asignacion.rol', 'rol')
      .leftJoinAndSelect('voluntario.usuario', 'usuario')
      .leftJoinAndSelect('tarea.fase', 'fase')
      .where('fase.id_proyecto = :projectId', { projectId })
      .getMany();

    // Obtener horas voluntariadas
    let horas = [];
    if (options.incluirHoras) {
      const horasQuery = this.horasRepo
        .createQueryBuilder('horas')
        .leftJoinAndSelect('horas.voluntario', 'voluntario')
        .leftJoinAndSelect('horas.tarea', 'tarea')
        .leftJoinAndSelect('voluntario.usuario', 'usuario')
        .where('horas.id_proyecto = :projectId', { projectId });

      if (options.fechaInicio) {
        horasQuery.andWhere('horas.fecha >= :fechaInicio', { fechaInicio: options.fechaInicio });
      }

      if (options.fechaFin) {
        horasQuery.andWhere('horas.fecha <= :fechaFin', { fechaFin: options.fechaFin });
      }

      horas = await horasQuery
        .orderBy('horas.fecha', 'DESC')
        .getMany();
    }

    // Obtener voluntarios únicos
    const voluntarios = [...new Map(
      asignaciones.map(a => [a.voluntario.id_voluntario, a.voluntario])
    ).values()];

    // Calcular estadísticas
    const estadisticas = await this.calculateProjectStatistics(projectId, fases, tareas, asignaciones, horas);

    return {
      proyecto,
      fases,
      tareas,
      voluntarios,
      horas,
      asignaciones,
      estadisticas,
      fechaGeneracion: new Date()
    };
  }

  /**
   * Calcula estadísticas del proyecto
   */
  async calculateProjectStatistics(
    projectId: number,
    fases: any[],
    tareas: any[],
    asignaciones: any[],
    horas: any[]
  ): Promise<any> {
    const totalFases = fases.length;
    const totalTareas = tareas.length;
    const totalVoluntarios = new Set(asignaciones.map(a => a.voluntario.id_voluntario)).size;
    
    // Estadísticas de tareas por estado
    const tareasPorEstado = tareas.reduce((acc, tarea) => {
      const estado = tarea.estado?.nombre || 'Sin estado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Progreso del proyecto
    const tareasCompletadas = tareas.filter(t => 
      t.estado?.nombre?.toLowerCase().includes('complet') ||
      t.estado?.nombre?.toLowerCase().includes('finaliz')
    ).length;
    
    const progresoProyecto = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

    // Estadísticas de horas
    const totalHoras = horas.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
    const horasVerificadas = horas.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
    const horasPendientes = totalHoras - horasVerificadas;

    // Horas por voluntario
    const horasPorVoluntario = horas.reduce((acc, hora) => {
      const voluntarioId = hora.voluntario.id_voluntario;
      const nombre = hora.voluntario.usuario.nombre;
      if (!acc[voluntarioId]) {
        acc[voluntarioId] = { nombre, horas: 0, registros: 0 };
      }
      acc[voluntarioId].horas += parseFloat(hora.horas_trabajadas.toString());
      acc[voluntarioId].registros += 1;
      return acc;
    }, {});

    // Progreso por fase
    const progresoPorFase = fases.map(fase => {
      const tareasDelFase = tareas.filter(t => t.fase.id_fase === fase.id_fase);
      const tareasCompletadasFase = tareasDelFase.filter(t => 
        t.estado?.nombre?.toLowerCase().includes('complet') ||
        t.estado?.nombre?.toLowerCase().includes('finaliz')
      ).length;
      
      return {
        fase: fase.nombre,
        totalTareas: tareasDelFase.length,
        tareasCompletadas: tareasCompletadasFase,
        progreso: tareasDelFase.length > 0 ? Math.round((tareasCompletadasFase / tareasDelFase.length) * 100) : 0
      };
    });

    return {
      resumen: {
        totalFases,
        totalTareas,
        totalVoluntarios,
        progresoProyecto,
        totalHoras: Math.round(totalHoras * 100) / 100,
        horasVerificadas: Math.round(horasVerificadas * 100) / 100,
        horasPendientes: Math.round(horasPendientes * 100) / 100
      },
      tareasPorEstado,
      horasPorVoluntario: Object.values(horasPorVoluntario),
      progresoPorFase
    };
  }

  /**
   * Genera reporte en formato PDF usando Puppeteer
   */
  async generatePDF(data: ReportData, options: ReportOptions): Promise<Buffer> {
    const html = await this.generateHTMLTemplate(data, options);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera reporte en formato Excel
   */
  async generateExcel(data: ReportData, options: ReportOptions): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    // Hoja de resumen
    const resumenData = [
      ['REPORTE DEL PROYECTO', data.proyecto.nombre],
      ['Fecha de generación', data.fechaGeneracion.toLocaleDateString()],
      ['Organización', data.proyecto.organizacion.nombre],
      [''],
      ['ESTADÍSTICAS GENERALES'],
      ['Total de fases', data.estadisticas.resumen.totalFases],
      ['Total de tareas', data.estadisticas.resumen.totalTareas],
      ['Total de voluntarios', data.estadisticas.resumen.totalVoluntarios],
      ['Progreso del proyecto', `${data.estadisticas.resumen.progresoProyecto}%`],
      ['Total de horas', data.estadisticas.resumen.totalHoras],
      ['Horas verificadas', data.estadisticas.resumen.horasVerificadas],
      ['Horas pendientes', data.estadisticas.resumen.horasPendientes]
    ];

    const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

    // Hoja de fases
    if (data.fases.length > 0) {
      const fasesData = [
        ['Orden', 'Nombre', 'Descripción', 'Fecha Inicio', 'Fecha Fin', 'Progreso']
      ];
      
      data.estadisticas.progresoPorFase.forEach((faseStats: any) => {
        const fase = data.fases.find(f => f.nombre === faseStats.fase);
        fasesData.push([
          fase?.orden || '',
          fase?.nombre || '',
          fase?.descripcion || '',
          fase?.fecha_inicio ? new Date(fase.fecha_inicio).toLocaleDateString() : '',
          fase?.fecha_fin ? new Date(fase.fecha_fin).toLocaleDateString() : '',
          `${faseStats.progreso}%`
        ]);
      });

      const fasesSheet = XLSX.utils.aoa_to_sheet(fasesData);
      XLSX.utils.book_append_sheet(workbook, fasesSheet, 'Fases');
    }

    // Hoja de tareas
    if (data.tareas.length > 0) {
      const tareasData = [
        ['Fase', 'Descripción', 'Estado', 'Prioridad', 'Fecha Inicio', 'Fecha Fin', 'Asignados']
      ];
      
      data.tareas.forEach(tarea => {
        const asignados = tarea.asignaciones?.map((a: any) => a.voluntario.usuario.nombre).join(', ') || '';
        tareasData.push([
          tarea.fase?.nombre || '',
          tarea.descripcion || '',
          tarea.estado?.nombre || '',
          tarea.prioridad || '',
          tarea.fecha_inicio ? new Date(tarea.fecha_inicio).toLocaleDateString() : '',
          tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString() : '',
          asignados
        ]);
      });

      const tareasSheet = XLSX.utils.aoa_to_sheet(tareasData);
      XLSX.utils.book_append_sheet(workbook, tareasSheet, 'Tareas');
    }

    // Hoja de horas (si se incluyen)
    if (options.incluirHoras && data.horas.length > 0) {
      const horasData = [
        ['Fecha', 'Voluntario', 'Tarea', 'Horas', 'Descripción', 'Verificada']
      ];
      
      data.horas.forEach(hora => {
        horasData.push([
          new Date(hora.fecha).toLocaleDateString(),
          hora.voluntario.usuario.nombre,
          hora.tarea?.descripcion || 'Horas generales',
          hora.horas_trabajadas,
          hora.descripcion || '',
          hora.verificada ? 'Sí' : 'No'
        ]);
      });

      const horasSheet = XLSX.utils.aoa_to_sheet(horasData);
      XLSX.utils.book_append_sheet(workbook, horasSheet, 'Horas');
    }

    // Hoja de voluntarios
    if (options.incluirVoluntarios && data.voluntarios.length > 0) {
      const voluntariosData = [
        ['Nombre', 'Email', 'Tareas Asignadas', 'Horas Totales', 'Horas Verificadas']
      ];
      
      data.voluntarios.forEach(voluntario => {
        const asignacionesVol = data.asignaciones.filter(a => a.voluntario.id_voluntario === voluntario.id_voluntario);
        const horasVol = data.horas.filter(h => h.voluntario.id_voluntario === voluntario.id_voluntario);
        const totalHoras = horasVol.reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        const horasVerificadas = horasVol.filter(h => h.verificada).reduce((sum, h) => sum + parseFloat(h.horas_trabajadas.toString()), 0);
        
        voluntariosData.push([
          voluntario.usuario.nombre,
          voluntario.usuario.email,
          asignacionesVol.length,
          Math.round(totalHoras * 100) / 100,
          Math.round(horasVerificadas * 100) / 100
        ]);
      });

      const voluntariosSheet = XLSX.utils.aoa_to_sheet(voluntariosData);
      XLSX.utils.book_append_sheet(workbook, voluntariosSheet, 'Voluntarios');
    }

    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  /**
   * Genera reporte en formato CSV
   */
  async generateCSV(data: ReportData, options: ReportOptions): Promise<Buffer> {
    const csvData = [];
    
    // Encabezado
    csvData.push(`REPORTE DEL PROYECTO: ${data.proyecto.nombre}`);
    csvData.push(`Fecha de generación: ${data.fechaGeneracion.toLocaleDateString()}`);
    csvData.push(`Organización: ${data.proyecto.organizacion.nombre}`);
    csvData.push('');
    
    // Estadísticas
    csvData.push('ESTADÍSTICAS GENERALES');
    csvData.push(`Total de fases,${data.estadisticas.resumen.totalFases}`);
    csvData.push(`Total de tareas,${data.estadisticas.resumen.totalTareas}`);
    csvData.push(`Total de voluntarios,${data.estadisticas.resumen.totalVoluntarios}`);
    csvData.push(`Progreso del proyecto,${data.estadisticas.resumen.progresoProyecto}%`);
    csvData.push(`Total de horas,${data.estadisticas.resumen.totalHoras}`);
    csvData.push('');
    
    // Tareas
    csvData.push('TAREAS');
    csvData.push('Fase,Descripción,Estado,Prioridad,Fecha Inicio,Fecha Fin');
    data.tareas.forEach(tarea => {
      csvData.push([
        tarea.fase?.nombre || '',
        `"${tarea.descripcion || ''}"`,
        tarea.estado?.nombre || '',
        tarea.prioridad || '',
        tarea.fecha_inicio ? new Date(tarea.fecha_inicio).toLocaleDateString() : '',
        tarea.fecha_fin ? new Date(tarea.fecha_fin).toLocaleDateString() : ''
      ].join(','));
    });

    return Buffer.from(csvData.join('\n'), 'utf-8');
  }

  /**
   * Genera plantilla HTML para PDF
   */
  async generateHTMLTemplate(data: ReportData, options: ReportOptions): Promise<string> {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte - ${data.proyecto.nombre}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2196F3; padding-bottom: 20px; margin-bottom: 30px; }
            .project-title { font-size: 24px; font-weight: bold; color: #2196F3; margin-bottom: 10px; }
            .organization { font-size: 16px; color: #666; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #2196F3; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
            .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2196F3; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .table th { background-color: #f5f5f5; font-weight: bold; }
            .progress-bar { width: 100%; height: 20px; background-color: #f0f0f0; border-radius: 10px; overflow: hidden; }
            .progress-fill { height: 100%; background-color: #4CAF50; transition: width 0.3s ease; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="project-title">${data.proyecto.nombre}</div>
            <div class="organization">${data.proyecto.organizacion.nombre}</div>
            <div style="margin-top: 10px; color: #666;">Reporte generado el ${data.fechaGeneracion.toLocaleDateString()}</div>
        </div>

        <div class="section">
            <div class="section-title">Estadísticas Generales</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.totalFases}</div>
                    <div class="stat-label">Fases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.totalTareas}</div>
                    <div class="stat-label">Tareas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.totalVoluntarios}</div>
                    <div class="stat-label">Voluntarios</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.progresoProyecto}%</div>
                    <div class="stat-label">Progreso</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.totalHoras}h</div>
                    <div class="stat-label">Horas Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${data.estadisticas.resumen.horasVerificadas}h</div>
                    <div class="stat-label">Horas Verificadas</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Progreso por Fase</div>
            ${data.estadisticas.progresoPorFase.map((fase: any) => `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><strong>${fase.fase}</strong></span>
                        <span>${fase.progreso}% (${fase.tareasCompletadas}/${fase.totalTareas})</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${fase.progreso}%;"></div>
                    </div>
                </div>
            `).join('')}
        </div>

        ${options.incluirDetalles ? `
        <div class="section">
            <div class="section-title">Detalle de Tareas</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Fase</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                        <th>Asignados</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.tareas.map(tarea => `
                        <tr>
                            <td>${tarea.fase?.nombre || ''}</td>
                            <td>${tarea.descripcion || ''}</td>
                            <td>${tarea.estado?.nombre || ''}</td>
                            <td>${tarea.prioridad || ''}</td>
                            <td>${tarea.asignaciones?.map((a: any) => a.voluntario.usuario.nombre).join(', ') || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${options.incluirVoluntarios ? `
        <div class="section">
            <div class="section-title">Horas por Voluntario</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Voluntario</th>
                        <th>Horas Totales</th>
                        <th>Registros</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.estadisticas.horasPorVoluntario.map((vol: any) => `
                        <tr>
                            <td>${vol.nombre}</td>
                            <td>${Math.round(vol.horas * 100) / 100}h</td>
                            <td>${vol.registros}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <div>Reporte generado por AfroImpacto - ${data.fechaGeneracion.toLocaleString()}</div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Valida acceso al proyecto
   */
  private async validateProjectAccess(projectId: number, user: Usuario): Promise<any> {
    const proyecto = await this.proyectoRepo.findOne({
      where: { id_proyecto: projectId },
      relations: ['organizacion']
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }

    // Validar permisos
    if (user.tipo_usuario === 'organizacion') {
      // Buscar la organización asociada al usuario
      const organizacion = await this.proyectoRepo.manager
        .createQueryBuilder('Organizacion', 'org')
        .where('org.id_usuario = :userId', { userId: user.id_usuario })
        .getOne();

      if (!organizacion || proyecto.id_organizacion !== organizacion.id_organizacion) {
        throw new BadRequestException('No tienes permisos para generar reportes de este proyecto');
      }
    } else if (user.tipo_usuario !== 'admin') {
      throw new BadRequestException('No tienes permisos para generar reportes');
    }

    return proyecto;
  }

  /**
   * Obtiene el estado de un reporte
   */
  async getReportStatus(reporteId: number): Promise<Reporte> {
    const reporte = await this.reporteRepo.findOne({
      where: { id_reporte: reporteId },
      relations: ['proyecto']
    });

    if (!reporte) {
      throw new NotFoundException(`Reporte con ID ${reporteId} no encontrado`);
    }

    return reporte;
  }

  /**
   * Descarga un reporte generado
   */
  async downloadReport(reporteId: number, user: Usuario): Promise<Buffer> {
    const reporte = await this.getReportStatus(reporteId);
    
    if (reporte.estado !== 'listo') {
      throw new BadRequestException('El reporte aún no está listo para descargar');
    }

    // Validar permisos
    await this.validateProjectAccess(reporte.id_proyecto, user);

    // Incrementar contador de descargas
    await this.reporteRepo.update(reporteId, {
      descargas: reporte.descargas + 1
    });

    // Aquí deberías leer el archivo del sistema de archivos
    // Por ahora, regeneramos el reporte
    return await this.generateReportSync(
      reporte.id_proyecto,
      reporte.tipo,
      reporte.formato as 'PDF' | 'Excel' | 'CSV',
      {
        incluirGraficos: reporte.incluir_graficos,
        incluirDetalles: true,
        incluirHoras: true,
        incluirVoluntarios: true
      },
      user
    );
  }
}
