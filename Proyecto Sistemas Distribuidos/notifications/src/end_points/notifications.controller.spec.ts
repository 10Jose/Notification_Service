import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as NotificationsService;
    controller = new NotificationsController(service);
  });

  describe('createNotification', () => {
    it('should return 201 response when valid payload is provided', async () => {
      const mockResult = {
        codigo: 201,
        mensaje: 'Notificación creada correctamente',
        fecha_creacion: '2026-09-22',
      };
      (service.create as any).mockResolvedValue(mockResult);

      const payload = {
        usuario_id: 25,
        tipo: 'recordatorio',
        titulo: 'Nueva acción asignada',
        mensaje: 'Se te ha asignado una nueva acción.',
        fecha_creacion: '2026-09-22',
        estado: 'realizado',
      };

      const result = await controller.createNotification(payload);
      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('getNotification', () => {
    it('should return 200 response with notifications array', async () => {
      const mockResult = [
        {
          tipo: 'recordatorio',
          titulo: 'Nueva acción asignada',
          mensaje: 'Se te ha asignado una nueva acción.',
          estado: 'realizado',
          fecha_creacion: '2026-10-10 22:00:00',
        },
      ];
      (service.findByUserId as any).mockResolvedValue(mockResult);

      const result = await controller.getNotification('25');
      expect(result).toEqual(mockResult);
      expect(service.findByUserId).toHaveBeenCalledWith('25');
    });

    it('should propagate 404 when user is not found', async () => {
      (service.findByUserId as any).mockRejectedValue(
        new HttpException(
          {
            codigo: 404,
            mensaje: 'Recurso no encontrado',
            detalle: ' la notificación con id 999 no existe',
          },
          HttpStatus.NOT_FOUND,
        ),
      );

      await expect(controller.getNotification('999')).rejects.toThrow(HttpException);
    });
  });
});
