import { v4 as uuidv4 } from "uuid";

/*
  NotificationFactory
  -------------------
  Patrón Factory que centraliza la creación de notificaciones.
  Cada worker o módulo de la app envía solo un "type" de evento.
  Este Factory decide cómo se construye el mensaje final.

  Ventajas:
  - Mantiene un formato estándar para todas las notificaciones.
  - Evita lógica duplicada en distintas partes del proyecto.
  - Facilita agregar nuevos tipos de notificación sin romper nada.
*/

export default class NotificationFactory {
  // Método estático para crear notificaciones según el tipo de evento
  static create(type, payload = {}) {
    switch (type) {

      /* ───────────────────────────────
         Invitado entra a la sala
         Evento emitido por syncRoom.worker.js
      ────────────────────────────────*/
      case "GUEST_JOINED":
        return {
          id: uuidv4(),         // ID único
          type: "info",         // Tipo de alerta
          message: `${payload.name} se ha unido a la sala 🎉`,
        };


      /* ───────────────────────────────
         El anfitrión presiona PLAY
      ────────────────────────────────*/
      case "HOST_PLAY":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión reprodujo la canción ▶️`,
        };


      /* ───────────────────────────────
         El anfitrión PAUSA la canción
      ────────────────────────────────*/
      case "HOST_PAUSE":
        return {
          id: uuidv4(),
          type: "info",
          message: `El anfitrión pausó la canción ⏸️`,
        };


      /* ───────────────────────────────
         El anfitrión CAMBIA de canción
         payload.title = nombre de la canción
      ────────────────────────────────*/
      case "HOST_CHANGED_SONG":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión cambió a: "${payload.title}" 🎵`,
        };


      /* ───────────────────────────────
         Estado del playback en la sala
         (PLAYING / PAUSED / STOPPED)
      ────────────────────────────────*/
      case "ROOM_PLAYBACK":
        return {
          id: uuidv4(),
          type: "info",
          message: `Estado de reproducción: ${payload.status} 🎛️`,
        };


      /* ───────────────────────────────
         Sala iniciada
      ────────────────────────────────*/
      case "ROOM_STARTED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala iniciada 🟢`,
        };


      /* ───────────────────────────────
         Sala detenida
      ────────────────────────────────*/
      case "ROOM_STOPPED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala detenida 🔴`,
        };


      /* ───────────────────────────────
         Estado general de la sala
         payload = { active, playback, guestsCount }
      ────────────────────────────────*/
      case "ROOM_STATUS":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala ${payload.active ? "activa" : "inactiva"}${
            payload.playback ? ` • Estado: ${payload.playback}` : ""
          } • Invitados: ${payload.guestsCount ?? 0}`,
        };


      /* ───────────────────────────────
         Caso por defecto:
         Si el worker envía un tipo no conocido
      ────────────────────────────────*/
      default:
        return {
          id: uuidv4(),
          type: "info",
          message: `Evento desconocido ⚠️`,
        };
    }
  }
}
