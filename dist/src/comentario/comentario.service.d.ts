import { Repository } from 'typeorm';
import { Comentario } from './comentario.entity';
import { CreateComentarioDto } from './create-comentario.dto';
import { UpdateComentarioDto } from './update-comentario.dto';
import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Fase } from '../fase/fase.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
export declare class ComentarioService {
    private readonly comentarioRepository;
    private readonly tareaRepository;
    private readonly proyectoRepository;
    private readonly faseRepository;
    private readonly usuarioRepository;
    private readonly notificacionService;
    constructor(comentarioRepository: Repository<Comentario>, tareaRepository: Repository<Tarea>, proyectoRepository: Repository<Proyecto>, faseRepository: Repository<Fase>, usuarioRepository: Repository<Usuario>, notificacionService: NotificacionService);
    create(createComentarioDto: CreateComentarioDto, idUsuario: number): Promise<Comentario>;
    findAll(tipoEntidad: string, idEntidad: number, includeRespuestas?: boolean): Promise<Comentario[]>;
    findOne(id: number): Promise<Comentario>;
    update(id: number, updateComentarioDto: UpdateComentarioDto, idUsuario: number): Promise<Comentario>;
    remove(id: number, idUsuario: number): Promise<void>;
    private validateEntity;
    private notificarMenciones;
    private notificarParticipantes;
}
