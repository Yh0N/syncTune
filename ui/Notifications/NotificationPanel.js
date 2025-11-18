// src/ui/Notifications/NotificationPanel.js
import { store } from "../../store/index.js";

export default function renderNotifications() {
  const notifList = document.getElementById("notif-list");
  if (!notifList) {
    console.error("No se encontró el elemento #notif-list en el DOM");
    return;
  }

  store.subscribe(() => {
    const state = store.getState();
    const notifications = state.notifications.notifications;

    notifList.innerHTML = "";
    notifications.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = `[${n.type}] ${n.message}`;
      notifList.appendChild(li);
    });
  });
}
