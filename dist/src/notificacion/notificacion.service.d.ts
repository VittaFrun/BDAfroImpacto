import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { Organizacion } from '../organizacion/organizacion.entity';
import { Voluntario } from '../voluntario/voluntario.entity';
import { Usuario } from '../users/user.entity';
export interface CrearNotificacionDto {
    id_usuario: number;
    titulo: string;
    mensaje: string;
    tipo?: string;
    id_proyecto?: number;
    tipo_entidad?: string;
    id_entidad?: number;
    datos_adicionales?: any;
}
export declare class NotificacionService {
    private readonly repo;
    private readonly orgRepo;
    private readonly volRepo;
    private readonly usuarioRepo;
    constructor(repo: Repository<Notificacion>, orgRepo: Repository<Organizacion>, volRepo: Repository<Voluntario>, usuarioRepo: Repository<Usuario>);
    crear(dto: CrearNotificacionDto): Promise<Notificacion>;
    crearMultiples(dtos: CrearNotificacionDto[]): Promise<Notificacion[]>;
    findByUsuario(id_usuario: number, soloNoLeidas?: boolean): Promise<Notificacion[]>;
    marcarComoLeida(id_notificacion: number, id_usuario: number): Promise<Notificacion>;
    marcarTodasComoLeidas(id_usuario: number): Promise<{
        message: string;
    }>;
    eliminar(id_notificacion: number, id_usuario: number): Promise<import("typeorm").DeleteResult>;
    contarNoLeidas(id_usuario: number): Promise<number>;
    notificarCambioEstadoProyecto(id_proyecto: number, id_organizacion: number, estadoAnterior: string, estadoNuevo: string, nombreProyecto: string): Promise<Notificacion>;
    notificarNuevaAsignacion(id_voluntario: number, id_proyecto: number, id_tarea: number, nombreTarea: string, nombreProyecto: string, nombreRol: string): Promise<Notificacion>;
    notificarNuevoComentario(id_usuario_comentario: number, id_tarea: number, id_proyecto: number, nombreTarea: string, nombreAutor: string, esMencion?: boolean): Promise<Notificacion[]>;
    notificarTareaProximaVencer(id_voluntario: number, id_proyecto: number, id_tarea: number, nombreTarea: string, fechaFin: Date, diasRestantes: number): Promise<Notificacion>;
    notificarTareaPendiente(id_voluntario: number, id_proyecto: number, id_tarea: number, nombreTarea: string, diasSinActividad: number): Promise<Notificacion>;
}
