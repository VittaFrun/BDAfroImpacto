import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Reporte } from './reporte.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Usuario } from '../users/user.entity';
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
export declare class ReporteGeneratorService {
    private readonly reporteRepo;
    private readonly proyectoRepo;
    private readonly horasRepo;
    private readonly asignacionRepo;
    private readonly tareaRepo;
    private readonly faseRepo;
    private readonly reporteQueue;
    constructor(reporteRepo: Repository<Reporte>, proyectoRepo: Repository<Proyecto>, horasRepo: Repository<HorasVoluntariadas>, asignacionRepo: Repository<Asignacion>, tareaRepo: Repository<Tarea>, faseRepo: Repository<Fase>, reporteQueue: Queue);
    generateReportAsync(projectId: number, tipo: string, formato: 'PDF' | 'Excel' | 'CSV', options: ReportOptions, user: Usuario): Promise<Reporte>;
    generateReportSync(projectId: number, tipo: string, formato: 'PDF' | 'Excel' | 'CSV', options: ReportOptions, user: Usuario): Promise<Buffer>;
    collectReportData(projectId: number, options: ReportOptions): Promise<ReportData>;
    calculateProjectStatistics(projectId: number, fases: any[], tareas: any[], asignaciones: any[], horas: any[]): Promise<any>;
    generatePDF(data: ReportData, options: ReportOptions): Promise<Buffer>;
    generateExcel(data: ReportData, options: ReportOptions): Promise<Buffer>;
    generateCSV(data: ReportData, options: ReportOptions): Promise<Buffer>;
    generateHTMLTemplate(data: ReportData, options: ReportOptions): Promise<string>;
    private validateProjectAccess;
    getReportStatus(reporteId: number): Promise<Reporte>;
    downloadReport(reporteId: number, user: Usuario): Promise<Buffer>;
}
