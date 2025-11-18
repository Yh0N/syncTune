import { store } from "/src/store/index.js";

let initialized = false;

export default function renderRooms(store, facade) {
  const btn = document.getElementById("start-room-btn");
  const inviteBtn = document.getElementById("invite-guest-btn");
  const list = document.getElementById("guests-list");
  const status = document.getElementById("room-status");

  if (!btn || !inviteBtn || !list || !status) {
    console.warn("⚠ No se encontraron elementos del panel de sala.");
    return;
  }

  // 🛑 Evita listeners duplicados (solo se ejecuta una vez)
  if (!initialized) {
    initialized = true;

    // ▶ Crear sala
    btn.addEventListener("click", () => {
      facade.startRoom();
    });

    // ➕ Invitar invitado
    inviteBtn.addEventListener("click", () => {
      const name = prompt("Nombre del invitado:");
      if (name && name.trim()) {
        facade.inviteGuest(name.trim());
      }
    });

    // 🔄 Un solo subscribe
    store.subscribe(() => {
      const state = store.getState().room;

      // Render lista invitados
      list.innerHTML = "";
      state.guests.forEach((g) => {
        const li = document.createElement("li");
        li.textContent = "👤 " + g.name;
        list.appendChild(li);
      });

      // Render estado sala: PLAYING / PAUSED / NULL
      let icon = "⏸";
      if (state.playback === "PLAYING") icon = "▶️";
      if (state.playback === "PAUSED") icon = "⏸";
      if (state.playback === "STOPPED") icon = "⛔";

      status.textContent = `Estado: ${icon} ${state.playback}`;
    });
  }
}
