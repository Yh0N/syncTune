// src/ui/Rooms/renderRooms.js
// ---------------------------------------------------------------------------
// Renderiza la UI de la sala de escucha compartida.
//
// Se conecta con WorkerFacade para:
//   Crear sala
//   Invitar invitados
//   Actualizar estado del playback
//
// También escucha el estado global en roomSlice.
// ---------------------------------------------------------------------------

import { store } from "/src/store/index.js";

let initialized = false; // Evita múltiples listeners

export default function renderRooms(store, facade) {
  const btn = document.getElementById("start-room-btn");
  const inviteBtn = document.getElementById("invite-guest-btn");
  const list = document.getElementById("guests-list");
  const status = document.getElementById("room-status");

  // Validar que existan los elementos en el DOM
  if (!btn || !inviteBtn || !list || !status) {
    console.warn("⚠ No se encontraron elementos del panel de sala.");
    return;
  }

  // Evita inicializar dos veces
  if (!initialized) {
    initialized = true;

    // ▶ START ROOM
    btn.addEventListener("click", () => {
      facade.startRoom();
    });

    // ➕ INVITAR INVITADO
    inviteBtn.addEventListener("click", () => {
      const name = prompt("Nombre del invitado:");
      if (name && name.trim()) {
        facade.inviteGuest(name.trim());
      }
    });

    // 🔄 Renderizar cuando cambie el store
    store.subscribe(() => {
      const state = store.getState().room;

      // Render lista de invitados
      list.innerHTML = "";
      state.guests.forEach((g) => {
        const li = document.createElement("li");
        li.textContent = "👤 " + g.name;
        list.appendChild(li);
      });

      // Mostrar estado del playback (icono + texto)
      let icon = "⏸";
      if (state.playback === "PLAYING") icon = "▶️";
      if (state.playback === "PAUSED") icon = "⏸";
      if (state.playback === "STOPPED") icon = "⛔";

      status.textContent = `Estado: ${icon} ${state.playback}`;
    });
  }
}
