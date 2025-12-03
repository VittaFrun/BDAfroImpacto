import { IsString, IsOptional, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCertificadoDto {
  @IsNumber()
  @IsNotEmpty()
  id_voluntario: number;

  @IsNumber()
  @IsOptional()
  id_proyecto?: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_emision: string;

  @IsDateString()
  @IsOptional()
  fecha_expiracion?: string;

  @IsString()
  @IsOptional()
  archivo_pdf?: string;
}

