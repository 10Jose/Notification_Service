import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import type { Model, Connection } from 'mongoose';
import { randomUUID } from 'crypto';
import { Notification, NotificationDocument } from './notification.schema.js';

export interface CreateNotificationDto {
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
  estado: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  getLocalTimeString(): string {
    const tz = process.env.TZ || 'America/Bogota';
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  getTodayDateString(): string {
    const tz = process.env.TZ || 'America/Bogota';
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private checkDbConnection() {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (this.connection.readyState !== 1) {
      throw new HttpException(
        {
          codigo: 503,
          mensaje: 'Servicio de notificaciones no disponible temporalmente. Intente más tarde.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private validateCreatePayload(body: any): CreateNotificationDto {
    if (!body || typeof body !== 'object') {
      throw new HttpException(
        {
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { usuario_id, tipo, titulo, mensaje, fecha_creacion, estado } = body;

    // usuario_id must be integer
    if (typeof usuario_id !== 'number' || !Number.isInteger(usuario_id)) {
      throw new HttpException(
        {
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // strings must be non-empty
    if (
      typeof tipo !== 'string' || tipo.trim() === '' ||
      typeof titulo !== 'string' || titulo.trim() === '' ||
      typeof mensaje !== 'string' || mensaje.trim() === '' ||
      typeof estado !== 'string' || estado.trim() === ''
    ) {
      throw new HttpException(
        {
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // fecha_creacion format YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
    const dateRegex = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/;
    if (typeof fecha_creacion !== 'string' || !dateRegex.test(fecha_creacion)) {
      throw new HttpException(
        {
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const match = fecha_creacion.match(dateRegex);
    const datePart = match![1];
    const timePart = match![2];

    const [year, month, day] = datePart.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      throw new HttpException(
        {
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Agrega la hora local del servidor si no viene especificada
    const localTime = this.getLocalTimeString();
    const finalFechaCreacion = timePart ? `${datePart} ${timePart}` : `${datePart} ${localTime}`;

    return {
      usuario_id,
      tipo: tipo.trim(),
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      fecha_creacion: finalFechaCreacion,
      estado: estado.trim(),
    };
  }

  async create(body: any) {
    const validated = this.validateCreatePayload(body);
    this.checkDbConnection();

    try {
      const notificacion_id = randomUUID();

      await this.notificationModel.create({
        notificacion_id,
        usuario_id: validated.usuario_id,
        tipo: validated.tipo,
        titulo: validated.titulo,
        mensaje: validated.mensaje,
        fecha_creacion: validated.fecha_creacion,
        estado: validated.estado,
      });

      return {
        codigo: 201,
        mensaje: 'Notificación creada correctamente',
        fecha_creacion: validated.fecha_creacion,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          codigo: 500,
          mensaje: 'Error en el servidor',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUserId(usuarioIdParam: string) {
    this.checkDbConnection();

    const parsedId = Number(usuarioIdParam);
    if (isNaN(parsedId) || !Number.isInteger(parsedId)) {
      throw new HttpException(
        {
          codigo: 404,
          mensaje: 'Recurso no encontrado',
          detalle: ` la notificación con id ${usuarioIdParam} no existe`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const todayStr = this.getTodayDateString();

    try {
      const notifications = await this.notificationModel
        .find({
          usuario_id: parsedId,
          $or: [
            { createdAt: { $gte: startOfToday, $lte: endOfToday } },
            { fecha_creacion: { $regex: `^${todayStr}` } },
          ],
        })
        .sort({ _id: -1 })
        .exec();

      if (!notifications || notifications.length === 0) {
        throw new HttpException(
          {
            codigo: 404,
            mensaje: 'Recurso no encontrado',
            detalle: ` la notificación con id ${usuarioIdParam} no existe`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return notifications.map((notification) => ({
        tipo: notification.tipo,
        titulo: notification.titulo,
        mensaje: notification.mensaje,
        estado: notification.estado,
        fecha_creacion: notification.fecha_creacion,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          codigo: 500,
          mensaje: 'Error inesperado del servicio',
          detalle: 'Error interno en el servicio de notificaciones ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
