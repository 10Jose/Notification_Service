# Notification_Service
Mircroservice Notification


Para probar el microservicio, por favro abarn si docker desktop, luego en la una terminal desde visual o en la de su prererencia que apunte a la carpeta dodne se encauntra alojado el servicoo, ejecuten:
-  docker compose up -d --build
-  Luego abran su API platform para probar la siguente peticiones:
-  GET:  http://localhost:3000/api/v1/notification/{id}
-  POST: http://localhost:3000/api/v1/notification/create-notifications
  Con el siguiente Body
 {
    "usuario_id":30,
    "tipo": "recordatorio",
    "titulo":"nueva adsaaasdddas",
    "mensaje": "asjdjajasdsad",
    "fecha_creacion": "2026-09-22",
    "estado": "realizado"

}

Las dependecias que usa el servicio podrán ser encontradas en el archivo package.json de /notifications/package.json
