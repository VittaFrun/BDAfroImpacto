import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  tipo: string;

  @IsEnum(['PDF', 'Excel', 'CSV'])
  formato: 'PDF' | 'Excel' | 'CSV';

  @IsNumber()
  id_proyecto: number;

  @IsOptional()
  @IsBoolean()
  incluir_graficos?: boolean;

  @IsOptional()
  @IsBoolean()
  incluir_detalles?: boolean;

  @IsOptional()
  @IsBoolean()
  incluir_horas?: boolean;

  @IsOptional()
  @IsBoolean()
  incluir_voluntarios?: boolean;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  plantilla?: string;
}