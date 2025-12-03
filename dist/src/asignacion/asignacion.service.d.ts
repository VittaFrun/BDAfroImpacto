import { Repository } from 'typeorm';
import { Asignacion } from './asignacion.entity';
import { CreateAsignacionDto } from './create-asignacion.dto';
import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Rol } from '../rol/rol.entity';
import { EliminacionHistorialService } from '../eliminacion-historial/eliminacion-historial.service';
import { NotificacionService } from '../notificacion/notificacion.service';
export declare class AsignacionService {
    private readonly repo;
    private readonly tareaRepo;
    private readonly proyectoRepo;
    private readonly orgRepo;
    private readonly voluntarioRepo;
    private readonly rolRepo;
    private readonly eliminacionHistorialService;
    private readonly notificacionService;
    constructor(repo: Repository<Asignacion>, tareaRepo: Repository<Tarea>, proyectoRepo: Repository<Proyecto>, orgRepo: Repository<Organizacion>, voluntarioRepo: Repository<Voluntario>, rolRepo: Repository<Rol>, eliminacionHistorialService: EliminacionHistorialService, notificacionService: NotificacionService);
    create(dto: CreateAsignacionDto, user: Usuario): Promise<Asignacion>;
    validateRolForProject(id_rol: number, id_proyecto: number): Promise<boolean>;
    findAllByTarea(idTarea: number): Promise<Asignacion[]>;
    findTasksByVoluntario(id_usuario: number): Promise<Asignacion[]>;
    findAsignacionesByProyecto(id_proyecto: number, id_usuario: number): Promise<Asignacion[]>;
    remove(id: number, user: Usuario): Promise<Asignacion>;
    getVolunteerAssignments(id_voluntario: number, id_proyecto?: number): Promise<Asignacion[]>;
    checkVolunteerAssignmentsInProject(id_voluntario: number, id_proyecto: number): Promise<{
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
    private checkOrganizacionOwnership;
}
