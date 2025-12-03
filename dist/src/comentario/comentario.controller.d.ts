import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './create-comentario.dto';
import { UpdateComentarioDto } from './update-comentario.dto';
import { Usuario } from '../users/user.entity';
export declare class ComentarioController {
    private readonly comentarioService;
    constructor(comentarioService: ComentarioService);
    create(createComentarioDto: CreateComentarioDto, user: Usuario): Promise<import("./comentario.entity").Comentario>;
    findAll(tipoEntidad: string, idEntidad: number, includeRespuestas?: string): Promise<import("./comentario.entity").Comentario[]>;
    findOne(id: number): Promise<import("./comentario.entity").Comentario>;
    update(id: number, updateComentarioDto: UpdateComentarioDto, user: Usuario): Promise<import("./comentario.entity").Comentario>;
    remove(id: number, user: Usuario): Promise<void>;
}
