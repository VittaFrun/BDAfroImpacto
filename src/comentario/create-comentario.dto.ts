import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, ValidateIf } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsEnum(['tarea', 'proyecto', 'fase'])
  tipo_entidad: 'tarea' | 'proyecto' | 'fase';

  @IsNumber()
  id_entidad: number;

  @IsOptional()
  @IsNumber()
  id_comentario_padre?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  menciones?: number[];

  @IsOptional()
  @IsArray()
  archivos_adjuntos?: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamaño: number;
  }>;
}

