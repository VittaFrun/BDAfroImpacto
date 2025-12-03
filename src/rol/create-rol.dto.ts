import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['organizacion', 'proyecto'])
  tipo_rol: 'organizacion' | 'proyecto';

  @IsOptional()
  @IsNumber({}, { message: 'id_organizacion debe ser un número' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  id_organizacion?: number;

  @IsOptional()
  @IsNumber({}, { message: 'id_proyecto debe ser un número' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  id_proyecto?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  activo?: boolean;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    // Validar formato hex si se proporciona
    if (value && typeof value === 'string') {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (hexRegex.test(value)) {
        return value.toUpperCase();
      }
    }
    return value || '#2196F3'; // Color por defecto
  })
  color?: string;
}