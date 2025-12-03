import { AsignacionService } from './asignacion.service';
import { CreateAsignacionDto } from './create-asignacion.dto';
import { Usuario } from '../users/user.entity';
import { SmartAssignmentService, SmartSuggestionRequest } from './smart-assignment.service';
export declare class AsignacionController {
    private readonly service;
    private readonly smartAssignmentService;
    constructor(service: AsignacionService, smartAssignmentService: SmartAssignmentService);
    create(dto: CreateAsignacionDto, user: Usuario): Promise<import("./asignacion.entity").Asignacion>;
    findAllByTarea(idTarea: string): Promise<import("./asignacion.entity").Asignacion[]>;
    findMyTasks(user: Usuario): Promise<import("./asignacion.entity").Asignacion[]>;
    findAsignacionesByProyecto(idProyecto: string, user: Usuario): Promise<import("./asignacion.entity").Asignacion[]>;
    remove(id: string, user: Usuario): Promise<import("./asignacion.entity").Asignacion>;
    checkVolunteerAssignments(idVoluntario: string): Promise<import("./asignacion.entity").Asignacion[]>;
    checkVolunteerAssignmentsInProject(idVoluntario: string, idProyecto: string): Promise<{
        hasAssignments: boolean;
        count: number;
        assignments: {
            id_asignacion: number;
            tarea: {
                id_tarea: number;
                nombre: string;
                estado: string;
            };
            rol: {
                id_rol: number;
                nombre: string;
            };
        }[];
    }>;
    generateSmartSuggestions(request: SmartSuggestionRequest, user: Usuario): Promise<import("./smart-assignment.service").TaskSuggestion[]>;
}
