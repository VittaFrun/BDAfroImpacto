import { IsString, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum TipoMensaje {
  TEXTO = 'texto',
  IMAGEN = 'imagen',
  ARCHIVO = 'archivo',
  SISTEMA = 'sistema',
}

export class CreateMensajeDto {
  @IsNumber()
  id_destinatario: number;

  @IsString()
  @MaxLength(5000)
  contenido: string;

  @IsEnum(TipoMensaje)
  @IsOptional()
  tipo?: TipoMensaje;

  @IsString()
  @IsOptional()
  archivo_url?: string;

  @IsString()
  @IsOptional()
  archivo_nombre?: string;

  @IsString()
  @IsOptional()
  archivo_tipo?: string;

  @IsNumber()
  @IsOptional()
  archivo_tamaño?: number;

  @IsNumber()
  @IsOptional()
  id_conversacion?: number;
}

