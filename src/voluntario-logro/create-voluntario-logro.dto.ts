import { IsNumber, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateVoluntarioLogroDto {
  @IsNumber()
  @IsNotEmpty()
  id_voluntario: number;

  @IsNumber()
  @IsNotEmpty()
  id_logro: number;

  @IsNumber()
  @IsOptional()
  proyecto_relacionado?: number;

  @IsDateString()
  @IsOptional()
  fecha_obtenido?: string;
}

