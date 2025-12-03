import { Repository } from 'typeorm';
import { Tarea } from '../tarea/tarea.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { NotificacionService } from './notificacion.service';
export declare class RecordatoriosService {
    private readonly tareaRepo;
    private readonly asignacionRepo;
    private readonly notificacionService;
    constructor(tareaRepo: Repository<Tarea>, asignacionRepo: Repository<Asignacion>, notificacionService: NotificacionService);
    verificarTareasProximasAVencer(): Promise<void>;
    verificarTareasPendientes(): Promise<void>;
}
