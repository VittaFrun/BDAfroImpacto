import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateLogroDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsNumber()
  @IsOptional()
  puntos?: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  condicion?: string;
}

