import { Estado } from '../estado/estado.entity';
import { Fase } from '../fase/fase.entity';
import { Asignacion } from '../asignacion/asignacion.entity';
import { Movimiento } from '../movimiento/movimiento.entity';
import { HorasVoluntariadas } from '../horas-voluntariadas/horas-voluntariadas.entity';
export declare class Tarea {
    id_tarea: number;
    descripcion: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    prioridad: string;
    complejidad: string;
    observaciones: string;
    id_estado: number;
    estado: Estado;
    id_fase: number;
    fase: Fase;
    creado_en: Date;
    actualizado_en: Date;
    asignaciones: Asignacion[];
    movimientos: Movimiento[];
    horasVoluntariadas: HorasVoluntariadas[];
}
