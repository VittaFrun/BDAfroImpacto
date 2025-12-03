import { Usuario } from '../users/user.entity';
import { Tarea } from '../tarea/tarea.entity';
import { Proyecto } from '../proyecto/proyecto.entity';
import { Fase } from '../fase/fase.entity';
export declare class Comentario {
    id_comentario: number;
    id_usuario: number;
    usuario: Usuario;
    contenido: string;
    tipo_entidad: string;
    id_entidad: number;
    id_tarea: number | null;
    tarea: Tarea | null;
    id_proyecto: number | null;
    proyecto: Proyecto | null;
    id_fase: number | null;
    fase: Fase | null;
    id_comentario_padre: number | null;
    comentario_padre: Comentario | null;
    respuestas: Comentario[];
    archivos_adjuntos: Array<{
        nombre: string;
        url: string;
        tipo: string;
        tamaño: number;
    }> | null;
    menciones: number[] | null;
    editado: boolean;
    fecha_edicion: Date | null;
    eliminado: boolean;
    fecha_eliminacion: Date | null;
    creado_en: Date;
    actualizado_en: Date;
}
