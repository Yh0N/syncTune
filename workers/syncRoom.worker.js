// ===========================================================================
// 🎧 syncRoom.worker.js
// ---------------------------------------------------------------------------
// Worker encargado de SIMULAR una sala compartida de música.
//
// Este Worker actúa como un "servidor local":
//   ✓ Maneja invitados
//   ✓ Conserva el estado de la sala (activa o no)
//   ✓ Procesa acciones del host (Play, Pause, Cambiar canción)
//   ✓ Envía eventos al UI mediante postMessage()
//
// Este Worker es consumido por WorkerFacade.js
// ===========================================================================


// ---------------------------------------------------------------------------
// ESTADO INTERNO DEL WORKER (solo existe aquí dentro)
// ---------------------------------------------------------------------------
let guests = [];               // Lista de invitados conectados
let roomActive = false;        // ¿La sala está activa?
let playbackStatus = null;     // "PLAYING" | "PAUSED" | null
let autoGuestInterval = null;  // Intervalo para invitados automáticos


// ---------------------------------------------------------------------------
// LISTA DE NOMBRES ALEATORIOS PARA SIMULAR INVITADOS
// ---------------------------------------------------------------------------
const randomNames = ["Bob", "Alice", "Carlos", "Diana", "Emily", "Frank"];

function getRandomGuest() {
  return randomNames[Math.floor(Math.random() * randomNames.length)];
}


// ---------------------------------------------------------------------------
// 🔄 Emitir al main thread el estado COMPLETO de la sala
// ---------------------------------------------------------------------------
function emitStatus() {
  self.postMessage({
    type: "ROOM_STATUS",
    active: roomActive,
    playback: playbackStatus,
    guests: [...guests], // copia para evitar mutaciones externas
  });
}


// ---------------------------------------------------------------------------
// 🤖 Invitados automáticos que llegan cada cierto tiempo
// ---------------------------------------------------------------------------
function startAutoGuests(intervalMs = 10000) {
  if (autoGuestInterval) return; // ya se está ejecutando → no duplicar

  autoGuestInterval = setInterval(() => {
    if (!roomActive) return; // no añadir si la sala está apagada

    const newGuest = getRandomGuest();
    guests.push(newGuest);

    // Notificamos al host que alguien entró
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
// 📩 MANEJO DE MENSAJES QUE RECIBE EL WORKER DESDE WorkerFacade.js
// ===========================================================================

self.onmessage = (e) => {
  const { type, songId, payload } = e.data;

  switch (type) {


    // -----------------------------------------------------------------------
    // 🟢 INICIAR SALA
    // -----------------------------------------------------------------------
    case "START_ROOM":
      roomActive = true;       // activamos la sala
      playbackStatus = null;   // aún no hay reproducción

      self.postMessage({ type: "ROOM_STARTED" }); // aviso a UI
      emitStatus();                           // Estado inicial

      // Invitado inicial simulado tras 1 segundo
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

      startAutoGuests(); // comenzar invitaciones automáticas
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

      // Enviar evento al hilo principal
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

      // Enviamos al UI qué canción eligió el host
      self.postMessage({
        type: "HOST_CHANGED_SONG",
        songId,
      });

      // Mantener estado PLAY/PAUSE actual
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
      stopAutoGuests();   // deja de generar invitados falsos
      guests = [];        // borrar invitados
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
