import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class SmartAssignmentService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,
  ) {}

  /**
   * Genera sugerencias inteligentes de asignación para un voluntario
   */
  async generateSmartSuggestions(request: SmartSuggestionRequest): Promise<TaskSuggestion[]> {
    // 1. Obtener tareas disponibles del proyecto
    const availableTasks = await this.getAvailableTasks(request.id_proyecto);
    
    // 2. Obtener roles disponibles del proyecto
    const availableRoles = await this.getAvailableRoles(request.id_proyecto);
    
    // 3. Obtener información del voluntario
    const volunteer = await this.voluntarioRepo.findOne({
      where: { id_voluntario: request.id_voluntario },
      relations: ['usuario']
    });

    if (!volunteer || availableTasks.length === 0) {
      return [];
    }

    // 4. Calcular compatibilidad para cada tarea
    const suggestions: TaskSuggestion[] = [];
    
    for (const task of availableTasks) {
      const compatibility = await this.calculateCompatibility(task, volunteer, request);
      const suggestedRole = this.selectBestRole(availableRoles, task, volunteer);
      
      if (compatibility > 30 && suggestedRole) { // Umbral mínimo de compatibilidad
        suggestions.push({
          id: task.id_tarea,
          descripcion: task.descripcion,
          prioridad: task.prioridad || 'Media',
          fase: {
            nombre: task.fase?.nombre || 'Sin fase',
            id_fase: task.fase?.id_fase || 0
          },
          role: {
            id_rol: suggestedRole.id_rol,
            nombre: suggestedRole.nombre,
            color: suggestedRole.color || '#2196F3'
          },
          compatibility,
          reasons: this.generateReasons(task, volunteer, compatibility, request)
        });
      }
    }

    // 5. Ordenar por compatibilidad y retornar top 5
    return suggestions
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5);
  }

  /**
   * Obtiene tareas disponibles para asignación
   */
  private async getAvailableTasks(projectId: number): Promise<any[]> {
    return await this.tareaRepo
      .createQueryBuilder('tarea')
      .leftJoinAndSelect('tarea.fase', 'fase')
      .leftJoinAndSelect('tarea.estado', 'estado')
      .leftJoinAndSelect('tarea.asignaciones', 'asignaciones')
      .where('fase.id_proyecto = :projectId', { projectId })
      .andWhere('tarea.id_estado IN (1, 2)') // Pendiente o En Progreso
      .orderBy('tarea.prioridad', 'DESC')
      .addOrderBy('tarea.fecha_fin', 'ASC')
      .getMany();
  }

  /**
   * Obtiene roles disponibles para el proyecto
   */
  private async getAvailableRoles(projectId: number): Promise<Rol[]> {
    return await this.rolRepo
      .createQueryBuilder('rol')
      .where('rol.activo = true')
      .andWhere(
        '(rol.tipo_rol = :tipoProyecto AND rol.id_proyecto = :projectId) OR ' +
        '(rol.tipo_rol = :tipoOrg AND rol.id_organizacion = (SELECT p.id_organizacion FROM proyecto p WHERE p.id_proyecto = :projectId))',
        { 
          tipoProyecto: 'proyecto', 
          tipoOrg: 'organizacion',
          projectId 
        }
      )
      .orderBy('rol.tipo_rol', 'DESC') // Priorizar roles de proyecto
      .getMany();
  }

  /**
   * Calcula la compatibilidad entre una tarea y un voluntario
   */
  private async calculateCompatibility(task: any, volunteer: any, request: SmartSuggestionRequest): Promise<number> {
    let compatibility = 50; // Base score
    const reasons = [];

    // Factor 1: Prioridad de la tarea (20 puntos máximo)
    switch (task.prioridad?.toLowerCase()) {
      case 'alta':
        compatibility += 20;
        reasons.push('Tarea de alta prioridad');
        break;
      case 'media':
        compatibility += 10;
        break;
      case 'baja':
        compatibility += 5;
        break;
    }

    // Factor 2: Carga de trabajo actual (15 puntos máximo)
    const currentAssignments = task.asignaciones?.length || 0;
    if (currentAssignments === 0) {
      compatibility += 15;
      reasons.push('Tarea sin asignar');
    } else if (currentAssignments < 2) {
      compatibility += 10;
      reasons.push('Poca carga de trabajo');
    } else {
      compatibility += 5;
    }

    // Factor 3: Proximidad de fecha límite (10 puntos máximo)
    if (task.fecha_fin) {
      const daysUntilDeadline = this.getDaysUntilDeadline(task.fecha_fin);
      if (daysUntilDeadline <= 7) {
        compatibility += 10;
        reasons.push('Fecha límite próxima');
      } else if (daysUntilDeadline <= 30) {
        compatibility += 5;
      }
    }

    // Factor 4: Coincidencia con experiencia (15 puntos máximo)
    if (request.experiencia) {
      const experienceMatch = this.calculateExperienceMatch(task.descripcion, request.experiencia);
      compatibility += experienceMatch;
      if (experienceMatch > 10) {
        reasons.push('Experiencia relacionada');
      }
    }

    // Factor 5: Coincidencia con motivación (10 puntos máximo)
    if (request.motivacion) {
      const motivationMatch = this.calculateMotivationMatch(task.descripcion, request.motivacion);
      compatibility += motivationMatch;
      if (motivationMatch > 5) {
        reasons.push('Alineado con motivación');
      }
    }

    // Asegurar que esté en el rango 0-100
    return Math.min(100, Math.max(0, compatibility));
  }

  /**
   * Selecciona el mejor rol para una tarea y voluntario
   */
  private selectBestRole(roles: Rol[], task: any, volunteer: any): Rol | null {
    if (roles.length === 0) return null;

    // Priorizar roles de proyecto sobre roles de organización
    const projectRoles = roles.filter(r => r.tipo_rol === 'proyecto');
    const orgRoles = roles.filter(r => r.tipo_rol === 'organizacion');

    // Si hay roles de proyecto, usar el primero
    if (projectRoles.length > 0) {
      return projectRoles[0];
    }

    // Si no, usar rol de organización
    if (orgRoles.length > 0) {
      return orgRoles[0];
    }

    return roles[0];
  }

  /**
   * Genera razones para la sugerencia
   */
  private generateReasons(task: any, volunteer: any, compatibility: number, request: SmartSuggestionRequest): string[] {
    const reasons = [];

    if (task.prioridad === 'Alta') {
      reasons.push('Tarea de alta prioridad que requiere atención inmediata');
    }

    if (!task.asignaciones || task.asignaciones.length === 0) {
      reasons.push('Tarea disponible sin asignaciones previas');
    }

    if (task.fecha_fin) {
      const days = this.getDaysUntilDeadline(task.fecha_fin);
      if (days <= 7) {
        reasons.push(`Fecha límite en ${days} días`);
      }
    }

    if (compatibility > 80) {
      reasons.push('Alta compatibilidad con el perfil del voluntario');
    } else if (compatibility > 60) {
      reasons.push('Buena compatibilidad con el perfil del voluntario');
    }

    return reasons.slice(0, 3); // Máximo 3 razones
  }

  /**
   * Calcula días hasta la fecha límite
   */
  private getDaysUntilDeadline(fechaFin: Date): number {
    const now = new Date();
    const deadline = new Date(fechaFin);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula coincidencia con experiencia (0-15 puntos)
   */
  private calculateExperienceMatch(taskDescription: string, experience: string): number {
    if (!taskDescription || !experience) return 0;

    const taskWords = this.extractKeywords(taskDescription.toLowerCase());
    const expWords = this.extractKeywords(experience.toLowerCase());
    
    const matches = taskWords.filter(word => expWords.includes(word));
    const matchRatio = matches.length / Math.max(taskWords.length, 1);
    
    return Math.round(matchRatio * 15);
  }

  /**
   * Calcula coincidencia con motivación (0-10 puntos)
   */
  private calculateMotivationMatch(taskDescription: string, motivation: string): number {
    if (!taskDescription || !motivation) return 0;

    const taskWords = this.extractKeywords(taskDescription.toLowerCase());
    const motWords = this.extractKeywords(motivation.toLowerCase());
    
    const matches = taskWords.filter(word => motWords.includes(word));
    const matchRatio = matches.length / Math.max(taskWords.length, 1);
    
    return Math.round(matchRatio * 10);
  }

  /**
   * Extrae palabras clave de un texto
   */
  private extractKeywords(text: string): string[] {
    // Palabras comunes a ignorar
    const stopWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'han', 'me', 'si', 'sin', 'sobre', 'este', 'ya', 'entre', 'cuando', 'todo', 'esta', 'ser', 'son', 'dos', 'también', 'fue', 'había', 'era', 'muy', 'años', 'hasta', 'desde', 'está', 'mi', 'porque', 'qué', 'sólo', 'han', 'yo', 'hay', 'vez', 'puede', 'todos', 'así', 'nos', 'ni', 'parte', 'tiene', 'él', 'uno', 'donde', 'bien', 'tiempo', 'mismo', 'ese', 'ahora', 'cada', 'e', 'vida', 'otro', 'después', 'te', 'otros', 'aunque', 'esa', 'eso', 'hace', 'otra', 'gobierno', 'tan', 'durante', 'siempre', 'día', 'tanto', 'ella', 'tres', 'sí', 'dijo', 'sido', 'gran', 'país', 'según', 'menos', 'mundo', 'año', 'antes', 'estado', 'quiero', 'mientras', 'sin', 'lugar', 'solo', 'nosotros', 'poder', 'decir', 'agua', 'más', 'nueva', 'muchos', 'hombre', 'días', 'muchas', 'manera', 'cosas', 'hoy', 'mayor', 'nada', 'llegar', 'hijo', 'vez', 'grupo', 'empresa', 'caso', 'semana', 'mano', 'sistema', 'después', 'trabajo', 'vida', 'ser', 'podría', 'primera', 'vez', 'hecho', 'mujer', 'usted', 'forma', 'contra', 'aquí', 'saber', 'agua', 'punto', 'derecha', 'pequeño', 'gran', 'mundo'];
    
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10); // Máximo 10 palabras clave
  }
}
