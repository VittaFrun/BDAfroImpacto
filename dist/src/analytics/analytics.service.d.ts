import { Repository } from 'typeorm';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Fase } from '../fase/fase.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
export interface ProjectAnalytics {
    resumen: {
        totalProyectos: number;
        proyectosActivos: number;
        proyectosCompletados: number;
        totalVoluntarios: number;
        totalHoras: number;
    };
    tendencias: {
        proyectosPorMes: any[];
        horasPorMes: any[];
        voluntariosPorMes: any[];
    };
    rendimiento: {
        promedioCompletacion: number;
        eficienciaHoras: number;
        retencionVoluntarios: number;
    };
}
export interface OrganizationAnalytics {
    proyectos: {
        total: number;
        activos: number;
        completados: number;
        enPausa: number;
    };
    voluntarios: {
        total: number;
        activos: number;
        nuevosEsteMes: number;
        retencion: number;
    };
    horas: {
        totalRegistradas: number;
        totalVerificadas: number;
        promedioSemanal: number;
        tendencia: 'subiendo' | 'bajando' | 'estable';
    };
    rendimiento: {
        tareasCompletadasATiempo: number;
        satisfaccionVoluntarios: number;
        eficienciaProyectos: number;
    };
}
export interface VolunteerAnalytics {
    actividad: {
        proyectosParticipados: number;
        tareasCompletadas: number;
        horasContribuidas: number;
        diasActivo: number;
    };
    rendimiento: {
        tareasATiempo: number;
        calificacionPromedio: number;
        consistencia: number;
    };
    progreso: {
        horasPorMes: any[];
        tareasCompletadasPorMes: any[];
        habilidadesDesarrolladas: string[];
    };
}
export declare class AnalyticsService {
    private readonly proyectoRepo;
    private readonly tareaRepo;
    private readonly faseRepo;
    private readonly horasRepo;
    private readonly asignacionRepo;
    private readonly voluntarioRepo;
    constructor(proyectoRepo: Repository<Proyecto>, tareaRepo: Repository<Tarea>, faseRepo: Repository<Fase>, horasRepo: Repository<HorasVoluntariadas>, asignacionRepo: Repository<Asignacion>, voluntarioRepo: Repository<Voluntario>);
    getProjectAnalytics(): Promise<ProjectAnalytics>;
    getOrganizationAnalytics(organizacionId: number): Promise<OrganizationAnalytics>;
    getVolunteerAnalytics(voluntarioId: number): Promise<VolunteerAnalytics>;
    private calculateHourEfficiency;
    private calculateHoursTrend;
    private calculateTasksOnTime;
    private calculateConsistency;
}
