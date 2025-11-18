// ===========================================================================
// 🎧 syncRoom.worker.js
// ---------------------------------------------------------------------------
// Worker encargado de SIMULAR una sala compartida de música.
//
// Funciona como "servidor local":
//  - Administra invitados
//  - Mantiene estado de la sala (activa / detenida)
//  - Recibe acciones del host: PLAY, PAUSE, CAMBIAR CANCIÓN
//  - Envía eventos al hilo principal mediante postMessage()
//
// Este Worker se usa con WorkerFacade.js
// ===========================================================================

// Estado interno de la sala (solo vive dentro del Worker)
let guests = [];
let roomActive = false;
let playbackStatus = null;       // "PLAYING" | "PAUSED" | null
let autoGuestInterval = null;    // Invitados automáticos

// Nombres aleatorios para simular usuarios reales
const randomNames = ["Bob", "Alice", "Carlos", "Diana", "Emily", "Frank"];

function getRandomGuest() {
  return randomNames[Math.floor(Math.random() * randomNames.length)];
}

// ---------------------------------------------------------------------------
// 🔄 Emitir estado completo de la sala
// ---------------------------------------------------------------------------
function emitStatus() {
  self.postMessage({
    type: "ROOM_STATUS",
    active: roomActive,
    playback: playbackStatus,
    guests: [...guests], // copiar array
  });
}

// ---------------------------------------------------------------------------
// 🤖 Invitados automáticos cada cierto tiempo
// ---------------------------------------------------------------------------
function startAutoGuests(intervalMs = 10000) {
  if (autoGuestInterval) return; // ya existe

  autoGuestInterval = setInterval(() => {
    if (!roomActive) return;

    const newGuest = getRandomGuest();
    guests.push(newGuest);

    self.postMessage({
      type: "GUEST_JOINED",
      user: newGuest,
    });

    emitStatus();
  }, intervalMs);
}

function stopAutoGuests() {
  if (autoGuestInterval) {
    clearInterval(autoGuestInterval);
    autoGuestInterval = null;
  }
}

// ===========================================================================
// 📩 MANEJO DE MENSAJES DESDE EL MAIN THREAD
// ===========================================================================
self.onmessage = (e) => {
  const { type, songId, payload } = e.data;

  switch (type) {

    // -----------------------------------------------------------------------
    // 🟢 INICIAR SALA
    // -----------------------------------------------------------------------
    case "START_ROOM":
      roomActive = true;
      playbackStatus = null; // Aún no reproducimos

      self.postMessage({ type: "ROOM_STARTED" });
      emitStatus();

      // Primer invitado simulado
      setTimeout(() => {
        if (!roomActive) return;

        const newGuest = getRandomGuest();
        guests.push(newGuest);

        self.postMessage({
          type: "GUEST_JOINED",
          user: newGuest,
        });

        emitStatus();
      }, 1000);

      startAutoGuests();
      break;

    // -----------------------------------------------------------------------
    // 👤 INVITAR INVITADO MANUALMENTE
    // -----------------------------------------------------------------------
    case "INVITE_GUEST":
      if (!roomActive || !payload?.name) return;

      guests.push(payload.name);

      self.postMessage({
        type: "GUEST_JOINED",
        user: payload.name,
      });

      emitStatus();
      break;

    // -----------------------------------------------------------------------
    // ▶ HOST → PLAY
    // -----------------------------------------------------------------------
    case "HOST_PLAY":
      if (!roomActive) return;

      playbackStatus = "PLAYING";

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    // -----------------------------------------------------------------------
    // ⏸ HOST → PAUSE
    // -----------------------------------------------------------------------
    case "HOST_PAUSE":
      if (!roomActive) return;

      playbackStatus = "PAUSED";

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    // -----------------------------------------------------------------------
    // 🔀 HOST CAMBIA CANCIÓN
    // -----------------------------------------------------------------------
    case "HOST_CHANGED_SONG":
      if (!roomActive) return;

      // Notificar al cliente qué canción seleccionó el host
      self.postMessage({
        type: "HOST_CHANGED_SONG",
        songId,
      });

      // Mantener estado actual de reproducción
      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    // -----------------------------------------------------------------------
    // 🔴 DETENER SALA
    // -----------------------------------------------------------------------
    case "STOP_ROOM":
      roomActive = false;
      stopAutoGuests();
      guests = [];
      playbackStatus = null;

      self.postMessage({ type: "ROOM_STOPPED" });
      emitStatus();
      break;

    // -----------------------------------------------------------------------
    // ❓ EVENTO DESCONOCIDO
    // -----------------------------------------------------------------------
    default:
      self.postMessage({
        type: "ERROR",
        message: `Evento ignorado: ${type}`,
      });
  }
};
