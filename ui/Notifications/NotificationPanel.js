// src/ui/Notifications/NotificationPanel.js
import { store } from "../../store/index.js";

export default function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) {
    console.error("❌ No existe #notif-list en el HTML");
    return;
  }

  store.subscribe(() => {
    const notifs = store.getState().notifications.notifications;

    list.innerHTML = "";

    notifs.forEach((n) => {
      const li = document.createElement("li");
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
