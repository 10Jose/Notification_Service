import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const config = new DocumentBuilder()
    .setTitle('CampusStudy — Servicio de Notificaciones')
    .setDescription(
      'Documentación OpenAPI/Swagger del Servicio de Notificaciones (Equipo 07). Gestiona y expone avisos académicos, recordatorios y notificaciones de estudiantes.',
    )
    .setVersion('1.0')
    .addTag('Notificaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
