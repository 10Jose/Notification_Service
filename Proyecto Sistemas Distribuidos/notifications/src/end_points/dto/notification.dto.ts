import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Identificador del usuario estudiante',
    example: 25,
    type: Number,
  })
  usuario_id: number;

  @ApiProperty({
    description: 'Tipo o clasificación de la notificación (de dónde proviene)',
    example: 'recordatorio',
    type: String,
  })
  tipo: string;

  @ApiProperty({
    description: 'Título de la acción o aviso',
    example: 'Nueva acción asignada',
    type: String,
  })
  titulo: string;

  @ApiProperty({
    description: 'Descripción o contenido del mensaje para el estudiante',
    example: 'Se te ha asignado una nueva acción.',
    type: String,
  })
  mensaje: string;

  @ApiProperty({
    description: 'Fecha en formato YYYY-MM-DD en que se inició la acción',
    example: '2026-09-22',
    type: String,
  })
  fecha_creacion: string;

  @ApiProperty({
    description: 'Estado de la notificación (realizado, pendiente, etc.)',
    example: 'realizado',
    type: String,
  })
  estado: string;
}

export class CreateNotificationResponseDto {
  @ApiProperty({ example: 201 })
  codigo: number;

  @ApiProperty({ example: 'Notificación creada correctamente' })
  mensaje: string;

  @ApiProperty({ example: '2026-09-22' })
  fecha_creacion: string;
}

export class GetNotificationResponseDto {
  @ApiProperty({ example: 'recordatorio' })
  tipo: string;

  @ApiProperty({ example: 'Nueva acción asignada' })
  titulo: string;

  @ApiProperty({ example: 'Se te ha asignado una nueva acción.' })
  mensaje: string;

  @ApiProperty({ example: 'realizado' })
  estado: string;

  @ApiProperty({ example: '2026-10-10 22:15:00' })
  fecha_creacion: string;
}

export class Error400ResponseDto {
  @ApiProperty({ example: 400 })
  codigo: number;

  @ApiProperty({
    example:
      'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
  })
  mensaje: string;
}

export class Error404ResponseDto {
  @ApiProperty({ example: 404 })
  codigo: number;

  @ApiProperty({ example: 'Recurso no encontrado' })
  mensaje: string;

  @ApiProperty({ example: ' la notificación con id 999 no existe' })
  detalle: string;
}

export class Error500ResponseDto {
  @ApiProperty({ example: 500 })
  codigo: number;

  @ApiProperty({ example: 'Error en el servidor' })
  mensaje: string;

  @ApiPropertyOptional({ example: 'Error interno en el servicio de notificaciones ' })
  detalle?: string;
}

export class Error503ResponseDto {
  @ApiProperty({ example: 503 })
  codigo: number;

  @ApiProperty({
    example: 'Servicio de notificaciones no disponible temporalmente. Intente más tarde.',
  })
  mensaje: string;
}
