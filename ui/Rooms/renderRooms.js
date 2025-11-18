import { store } from "/src/store/index.js";

export default function renderRooms(store, facade) {
  const btn = document.getElementById("start-room-btn");
  const inviteBtn = document.getElementById("invite-guest-btn");
  const list = document.getElementById("guests-list");
  const status = document.getElementById("room-status");

  // Si no existen los elementos, salir sin errores
  if (!btn || !inviteBtn || !list || !status) {
    console.warn("⚠ No se encontraron elementos del panel de sala.");
    return;
  }

  // ▶ Iniciar sala
  btn.addEventListener("click", () => {
    facade.startRoom();
  });

  // ➕ INVITAR INVITADO
  inviteBtn.addEventListener("click", () => {
    const name = prompt("Nombre del invitado:");

    if (name && name.trim().length > 0) {
      facade.inviteGuest(name.trim());
    }
  });

  // 🔄 Escuchar cambios del estado de sala
  store.subscribe(() => {
    const state = store.getState().room;

    // Lista de invitados
    list.innerHTML = "";
    state.guests.forEach((g) => {
      const li = document.createElement("li");
      li.textContent = "👤 " + g.name;
      list.appendChild(li);
    });

    // Estado de reproducción
    status.textContent = "Estado: " + state.playback;
  });
}
