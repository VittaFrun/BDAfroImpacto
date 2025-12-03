import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsDecimal, Min, Max, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProyectoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000, { message: 'La descripción debe tener entre 10 y 1000 caracteres' })
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000, { message: 'El objetivo debe tener entre 10 y 1000 caracteres' })
  objetivo: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'La ubicación debe tener entre 3 y 100 caracteres' })
  ubicacion: string;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty()
  fecha_inicio: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty()
  fecha_fin: string;

  @IsString()
  @IsOptional()
  @Length(0, 255, { message: 'La imagen principal no puede exceder 255 caracteres' })
  imagen_principal?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255, { message: 'El banner no puede exceder 255 caracteres' })
  banner?: string;

  @IsString()
  @IsOptional()
  @Length(0, 255, { message: 'El documento no puede exceder 255 caracteres' })
  documento?: string;

  @IsNumber({}, { message: 'El presupuesto total debe ser un número válido' })
  @IsOptional()
  @Min(0, { message: 'El presupuesto total no puede ser negativo' })
  @Transform(({ value }) => parseFloat(value))
  presupuesto_total?: number;


  @IsNumber({}, { message: 'El ID del estado debe ser un número válido' })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : 1)
  id_estado?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  es_publico?: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 50, { message: 'La categoría no puede exceder 50 caracteres' })
  categoria?: string;

  @IsString()
  @IsOptional()
  requisitos?: string;
}
