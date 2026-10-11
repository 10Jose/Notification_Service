import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: 'notifications', timestamps: true, versionKey: false })
export class Notification {
  @Prop({ required: true, unique: true })
  notificacion_id: string;

  @Prop({ required: true, index: true })
  usuario_id: number;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ required: true })
  fecha_creacion: string;

  @Prop({ required: true })
  estado: string;

  @Prop({ required: false })
  referencia_id?: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
