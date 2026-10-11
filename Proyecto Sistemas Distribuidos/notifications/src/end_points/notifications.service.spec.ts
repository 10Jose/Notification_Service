import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockModel: any;
  let mockConnection: any;

  beforeEach(() => {
    mockModel = {
      create: vi.fn(),
      find: vi.fn(),
    };
    mockConnection = {
      readyState: 1, // Connected
    };
    service = new NotificationsService(mockModel, mockConnection);
  });

  describe('create', () => {
    const validBody = {
      usuario_id: 25,
      tipo: 'recordatorio',
      titulo: 'Nueva acción asignada',
      mensaje: 'Se te ha asignado una nueva acción.',
      fecha_creacion: '2026-09-22',
      estado: 'realizado',
    };

    it('should create a notification successfully appending server local time to fecha_creacion', async () => {
      mockModel.create.mockResolvedValue({});

      const result = await service.create(validBody);

      expect(result.codigo).toBe(201);
      expect(result.mensaje).toBe('Notificación creada correctamente');
      expect(result.fecha_creacion).toMatch(/^2026-09-22 \d{2}:\d{2}:\d{2}$/);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 25,
          tipo: 'recordatorio',
          titulo: 'Nueva acción asignada',
          mensaje: 'Se te ha asignado una nueva acción.',
          fecha_creacion: expect.stringMatching(/^2026-09-22 \d{2}:\d{2}:\d{2}$/),
          estado: 'realizado',
          notificacion_id: expect.any(String),
        }),
      );
    });

    it('should throw 400 when required fields are missing', async () => {
      const invalidBody = {
        usuario_id: 25,
        // tipo is missing
        titulo: 'Nueva acción asignada',
      };

      try {
        await service.create(invalidBody);
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(err.getResponse()).toEqual({
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        });
      }
    });

    it('should throw 400 when fecha_creacion is invalid format', async () => {
      const invalidBody = {
        ...validBody,
        fecha_creacion: '22-09-2026',
      };

      try {
        await service.create(invalidBody);
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(err.getResponse()).toEqual({
          codigo: 400,
          mensaje: 'Solicitud incorrecta: faltan campos obligatorios o el formato de fecha_creacion no es válido.',
        });
      }
    });

    it('should throw 503 when database is disconnected', async () => {
      mockConnection.readyState = 0; // Disconnected

      try {
        await service.create(validBody);
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(err.getResponse()).toEqual({
          codigo: 503,
          mensaje: 'Servicio de notificaciones no disponible temporalmente. Intente más tarde.',
        });
      }
    });
  });

  describe('findByUserId', () => {
    it('should return array of notifications from today for user', async () => {
      const mockDoc = {
        tipo: 'recordatorio',
        titulo: 'Nueva acción asignada',
        mensaje: 'Se te ha asignado una nueva acción.',
        estado: 'realizado',
        fecha_creacion: '2026-10-10 22:00:00',
      };

      mockModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([mockDoc]),
        }),
      });

      const result = await service.findByUserId('25');
      expect(result).toEqual([
        {
          tipo: 'recordatorio',
          titulo: 'Nueva acción asignada',
          mensaje: 'Se te ha asignado una nueva acción.',
          estado: 'realizado',
          fecha_creacion: '2026-10-10 22:00:00',
        },
      ]);
    });

    it('should throw 404 when user id has no notifications today', async () => {
      mockModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      try {
        await service.findByUserId('999');
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(err.getResponse()).toEqual({
          codigo: 404,
          mensaje: 'Recurso no encontrado',
          detalle: ' la notificación con id 999 no existe',
        });
      }
    });
  });
});
