let guests = [];
let roomActive = false;
let playbackStatus = null; // estado interno del reproductor (null al inicio)
let autoGuestInterval = null;

// Nombres simulados
const randomNames = ["Bob", "Alice", "Carlos", "Diana", "Emily", "Frank"];

function getRandomGuest() {
  return randomNames[Math.floor(Math.random() * randomNames.length)];
}

// Emitir estado global de la sala
function emitStatus() {
  self.postMessage({
    type: "ROOM_STATUS",
    active: roomActive,
    playback: playbackStatus,
    guests: [...guests],
  });
}

// 🔥 Invitados automáticos (solo si sala activa)
function startAutoGuests(intervalMs = 10000) {
  if (autoGuestInterval) return;

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

// 📩 EVENTOS QUE RECIBE EL WORKER
self.onmessage = (e) => {
  const { type, songId, payload } = e.data;

  switch (type) {
    /* =============================
       🟢 CREAR SALA
    ============================== */
    case "START_ROOM":
      roomActive = true;
      playbackStatus = null; // no mostrar PAUSED por defecto

      // Notificar arranque
      self.postMessage({ type: "ROOM_STARTED" });
      emitStatus();

      // Primer invitado
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

    /* =============================
       ➕ INVITAR MANUAL
    ============================== */
    case "INVITE_GUEST":
      if (!roomActive || !payload?.name) return;

      guests.push(payload.name);

      self.postMessage({
        type: "GUEST_JOINED",
        user: payload.name,
      });

      emitStatus();
      break;

    /* =============================
       ▶ HOST PLAY
    ============================== */
    case "HOST_PLAY":
      if (!roomActive) return;

      playbackStatus = "PLAYING";

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    /* =============================
       ⏸ HOST PAUSE
    ============================== */
    case "HOST_PAUSE":
      if (!roomActive) return;

      playbackStatus = "PAUSED";

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    /* =============================
       🔀 HOST CAMBIA CANCIÓN
    ============================== */
    case "HOST_CHANGED_SONG":
      if (!roomActive) return;

      self.postMessage({
        type: "HOST_CHANGED_SONG",
        songId,
      });

      // Mantener estado actual (PLAYING o PAUSED)
      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: playbackStatus,
      });

      emitStatus();
      break;

    /* =============================
       🔴 DETENER SALA
    ============================== */
    case "STOP_ROOM":
      roomActive = false;
      stopAutoGuests();
      guests = [];
      playbackStatus = null;

      self.postMessage({ type: "ROOM_STOPPED" });
      emitStatus();
      break;

    default:
      self.postMessage({
        type: "ERROR",
        message: `Evento ignorado: ${type}`,
      });
  }
};
