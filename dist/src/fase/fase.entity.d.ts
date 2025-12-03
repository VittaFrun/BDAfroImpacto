import { Proyecto } from '../proyecto/proyecto.entity';
import { Tarea } from '../tarea/tarea.entity';
export declare class Fase {
    id_fase: number;
    nombre: string;
    descripcion: string;
    orden: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    id_proyecto: number;
    proyecto: Proyecto;
    creado_en: Date;
    actualizado_en: Date;
    tareas: Tarea[];
}
