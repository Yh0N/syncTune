import { v4 as uuidv4 } from "uuid";
// ↑ Librería que genera IDs únicos (para que cada notificación tenga un ID diferente)


/*
  NotificationFactory
  -------------------
  Este archivo implementa el PATRÓN FACTORY.

  ¿Qué hace?
  - Recibe un "type" (tipo de evento).
  - Según el tipo, construye una notificación lista para mostrarse en pantalla.
  - Mantiene un formato estándar en TODAS las notificaciones de la app.
  - Evita tener este switch repetido por toda la aplicación.

  Ventaja:
  → Cada worker solo envía un "evento", y aquí decidimos qué mensaje mostrar.
*/


export default class NotificationFactory {

  // Método estático: se puede llamar sin crear instancias
  // Ej: NotificationFactory.create("GUEST_JOINED", { name: "Carlos" })
  static create(type, payload = {}) {

    // Analizamos el tipo de notificación mediante un switch
    switch (type) {

      /* ──────────────────────────────────────────────
         1. Invitado entra a la sala
         → Evento enviado por syncRoom.worker.js
      ───────────────────────────────────────────────*/
      case "GUEST_JOINED":
        return {
          id: uuidv4(),               // ID único
          type: "info",               // Tipo visual de notificación
          message: `${payload.name} se ha unido a la sala 🎉`, // Texto
        };


      /* ──────────────────────────────────────────────
         2. El host presiona PLAY
      ───────────────────────────────────────────────*/
      case "HOST_PLAY":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión reprodujo la canción ▶️`,
        };


      /* ──────────────────────────────────────────────
         3. El host presiona PAUSE
      ───────────────────────────────────────────────*/
      case "HOST_PAUSE":
        return {
          id: uuidv4(),
          type: "info",
          message: `El anfitrión pausó la canción ⏸️`,
        };


      /* ──────────────────────────────────────────────
         4. El host cambia de canción
         payload.title = nombre de la canción
      ───────────────────────────────────────────────*/
      case "HOST_CHANGED_SONG":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión cambió a: "${payload.title}" 🎵`,
        };


      /* ──────────────────────────────────────────────
         5. Estado de reproducción general de la sala
         PLAYING / PAUSED / STOPPED
      ───────────────────────────────────────────────*/
      case "ROOM_PLAYBACK":
        return {
          id: uuidv4(),
          type: "info",
          message: `Estado de reproducción: ${payload.status} 🎛️`,
        };


      /* ──────────────────────────────────────────────
         6. Sala iniciada
      ───────────────────────────────────────────────*/
      case "ROOM_STARTED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala iniciada 🟢`,
        };


      /* ──────────────────────────────────────────────
         7. Sala detenida
      ───────────────────────────────────────────────*/
      case "ROOM_STOPPED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala detenida 🔴`,
        };


      /* ──────────────────────────────────────────────
         8. Estado general de la sala
         payload = { active, playback, guestsCount }
      ───────────────────────────────────────────────*/
      case "ROOM_STATUS":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala ${payload.active ? "activa" : "inactiva"}${
            payload.playback ? ` • Estado: ${payload.playback}` : ""
          } • Invitados: ${payload.guestsCount ?? 0}`,
        };


      /* ──────────────────────────────────────────────
         9. Si llega un tipo desconocido
         → Esto evita errores y mantiene consistencia
      ───────────────────────────────────────────────*/
      default:
        return {
          id: uuidv4(),
          type: "info",
          message: `Evento desconocido ⚠️`,
        };
    }
  }
}
