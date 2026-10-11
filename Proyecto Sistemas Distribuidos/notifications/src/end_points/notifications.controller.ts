import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import {
  CreateNotificationDto,
  CreateNotificationResponseDto,
  GetNotificationResponseDto,
  Error400ResponseDto,
  Error404ResponseDto,
  Error500ResponseDto,
  Error503ResponseDto,
} from './dto/notification.dto.js';

@ApiTags('Notificaciones')
@Controller('api/v1/notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('create-notifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Creación de las notificaciones',
    description:
      'Expone y crea las notificaciones que serán consumidas por el frontend, reflejando los cambios realizados en los servicios de tareas, materias y usuarios.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'La notificación se crea correctamente.',
    type: CreateNotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
    type: Error400ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Fallo inesperado en el servidor, base de datos o servicio interno.',
    type: Error500ResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio de notificaciones no disponible temporalmente.',
    type: Error503ResponseDto,
  })
  async createNotification(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }

  @Get(':usuario_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exposición de las notificaciones',
    description:
      'Expone todas las notificaciones disponibles del usuario_id consultado.',
  })
  @ApiParam({
    name: 'usuario_id',
    type: Number,
    description: 'Identificador del estudiante',
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones de hoy mostradas del usuario_id.',
    type: [GetNotificationResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'El id del usuario consultado no existe.',
    type: Error404ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Fallo inesperado en el servidor, base de datos o servicio interno.',
    type: Error500ResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio de notificaciones no disponible temporalmente.',
    type: Error503ResponseDto,
  })
  async getNotification(@Param('usuario_id') usuario_id: string) {
    return this.notificationsService.findByUserId(usuario_id);
  }
}
