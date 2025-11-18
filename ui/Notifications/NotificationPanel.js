// src/ui/Notifications/NotificationPanel.js
// ---------------------------------------------------------------------------
// Renderiza la lista de notificaciones generadas por toda la app.
//
// Escucha cambios del store y pinta cada notificación en el DOM.
// ---------------------------------------------------------------------------

import { store } from "../../store/index.js";

export default function renderNotifications() {
  const list = document.getElementById("notif-list");

  // Si no existe el contenedor, avisamos
  if (!list) {
    console.error("❌ No existe #notif-list en el HTML");
    return;
  }

  // Nos suscribimos al store para re-renderizar automáticamente
  store.subscribe(() => {
    const notifs = store.getState().notifications.notifications;

    // Limpiamos render
    list.innerHTML = "";

    // Agregamos cada notificación como <li>
    notifs.forEach((n) => {
      const li = document.createElement("li");

      // Estilos simples
      li.style.padding = "6px";
      li.style.marginBottom = "4px";
      li.style.borderLeft = "4px solid #4caf50";
      li.style.background = "#222";
      li.style.fontSize = "13px";

      li.innerHTML = `<strong>[${n.type}]</strong> ${n.message}`;
      list.appendChild(li);
    });
  });
}
