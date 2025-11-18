// src/workers/syncRoom.worker.js

let guests = [];
let roomActive = false;
let autoGuestInterval = null;

// Nombres simulados
const randomNames = ["Bob", "Alice", "Carlos", "Diana", "Emily", "Frank"];

function getRandomGuest() {
  return randomNames[Math.floor(Math.random() * randomNames.length)];
}

// 🔥 Invitados automáticos (solo si sala activa)
function startAutoGuests() {
  if (autoGuestInterval) return;

  autoGuestInterval = setInterval(() => {
    if (!roomActive) return;

    const newGuest = getRandomGuest();
    guests.push(newGuest);

    self.postMessage({
      type: "GUEST_JOINED",
      user: newGuest,
    });
  }, 10000);
}

function stopAutoGuests() {
  clearInterval(autoGuestInterval);
  autoGuestInterval = null;
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

      // Primer invitado
      setTimeout(() => {
        const newGuest = getRandomGuest();
        guests.push(newGuest);

        self.postMessage({
          type: "GUEST_JOINED",
          user: newGuest,
        });
      }, 1000);

      startAutoGuests();
      break;

    /* =============================
       ➕ INVITAR MANUAL
    ============================== */
    case "INVITE_GUEST":
      if (!roomActive) return;

      guests.push(payload.name);

      self.postMessage({
        type: "GUEST_JOINED",
        user: payload.name,
      });
      break;

    /* =============================
       ▶ HOST PLAY
    ============================== */
    case "HOST_PLAY":
      if (!roomActive) return;

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: "PLAYING",
      });

      break;

    /* =============================
       ⏸ HOST PAUSE
    ============================== */
    case "HOST_PAUSE":
      if (!roomActive) return;

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: "PAUSED",
      });

      break;

    /* =============================
       🔀 HOST CAMBIA CANCIÓN
    ============================== */
    case "HOST_CHANGED_SONG":
      if (!roomActive) return;

      // 🔥 RESTAURADO → Cuando cambia canción siempre envía PLAYING
      self.postMessage({
        type: "HOST_CHANGED_SONG",
        songId,
      });

      self.postMessage({
        type: "ROOM_PLAYBACK",
        status: "PLAYING",
      });

      break;

    /* =============================
       🔴 DETENER SALA
    ============================== */
    case "STOP_ROOM":
      roomActive = false;
      stopAutoGuests();
      guests = [];
      break;

    default:
      console.log("Evento ignorado:", type);
  }
};
