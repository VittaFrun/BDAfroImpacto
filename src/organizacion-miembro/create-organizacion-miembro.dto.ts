import { IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateOrganizacionMiembroDto {
  @IsNumber()
  id_organizacion: number;

  @IsNumber()
  id_voluntario: number;

  @IsOptional()
  @IsNumber()
  id_rol_organizacion?: number | null;

  @IsOptional()
  @IsEnum(['pendiente', 'activo', 'inactivo'])
  estado?: 'pendiente' | 'activo' | 'inactivo';

  @IsOptional()
  @IsDateString()
  fecha_solicitud?: Date | null;

  @IsOptional()
  @IsDateString()
  fecha_aprobacion?: Date | null;
}

