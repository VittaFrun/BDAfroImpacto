import { Repository } from 'typeorm';
import { Tarea } from '../tarea/tarea.entity';
import { Rol } from '../rol/rol.entity';
import { Asignacion } from './asignacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
export interface SmartSuggestionRequest {
    id_proyecto: number;
    id_voluntario: number;
    motivacion?: string;
    experiencia?: string;
    disponibilidad?: string;
}
export interface TaskSuggestion {
    id: number;
    descripcion: string;
    prioridad: string;
    fase: {
        nombre: string;
        id_fase: number;
    };
    role: {
        id_rol: number;
        nombre: string;
        color: string;
    };
    compatibility: number;
    reasons: string[];
}
export declare class SmartAssignmentService {
    private readonly tareaRepo;
    private readonly rolRepo;
    private readonly asignacionRepo;
    private readonly voluntarioRepo;
    constructor(tareaRepo: Repository<Tarea>, rolRepo: Repository<Rol>, asignacionRepo: Repository<Asignacion>, voluntarioRepo: Repository<Voluntario>);
    generateSmartSuggestions(request: SmartSuggestionRequest): Promise<TaskSuggestion[]>;
    private getAvailableTasks;
    private getAvailableRoles;
    private calculateCompatibility;
    private selectBestRole;
    private generateReasons;
    private getDaysUntilDeadline;
    private calculateExperienceMatch;
    private calculateMotivationMatch;
    private extractKeywords;
}
