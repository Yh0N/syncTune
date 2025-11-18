import { v4 as uuidv4 } from "uuid";

export default class NotificationFactory {
  static create(type, payload = {}) {
    switch (type) {
      /* ---------------------
         Invitados
      ----------------------*/
      case "GUEST_JOINED":
        return {
          id: uuidv4(),
          type: "info",
          message: `${payload.name} se ha unido a la sala 🎉`,
        };

      /* ---------------------
         Host reprodujo
      ----------------------*/
      case "HOST_PLAY":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión reprodujo la canción ▶️`,
        };

      /* ---------------------
         Host pausó
      ----------------------*/
      case "HOST_PAUSE":
        return {
          id: uuidv4(),
          type: "info",
          message: `El anfitrión pausó la canción ⏸️`,
        };

      /* ---------------------
         Host cambió canción
      ----------------------*/
      case "HOST_CHANGED_SONG":
        return {
          id: uuidv4(),
          type: "success",
          message: `El anfitrión cambió a: "${payload.title}" 🎵`,
        };

      /* ---------------------
         Sincronización playback
      ----------------------*/
      case "ROOM_PLAYBACK":
        return {
          id: uuidv4(),
          type: "info",
          message: `Estado de reproducción: ${payload.status} 🎛️`,
        };

      /* ---------------------
         Sala iniciada / detenida
      ----------------------*/
      case "ROOM_STARTED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala iniciada 🟢`,
        };

      case "ROOM_STOPPED":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala detenida 🔴`,
        };

      /* ---------------------
         Estado global de la sala
      ----------------------*/
      case "ROOM_STATUS":
        return {
          id: uuidv4(),
          type: "info",
          message: `Sala ${payload.active ? "activa" : "inactiva"}${
            payload.playback ? ` • Estado: ${payload.playback}` : ""
          } • Invitados: ${payload.guestsCount ?? 0}`,
        };

      /* ---------------------
         Default
      ----------------------*/
      default:
        return {
          id: uuidv4(),
          type: "info",
          message: `Evento desconocido ⚠️`,
        };
    }
  }
}
