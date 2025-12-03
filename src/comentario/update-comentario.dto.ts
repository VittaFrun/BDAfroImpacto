import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateComentarioDto {
  @IsOptional()
  @IsString()
  contenido?: string;

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

