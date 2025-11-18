import { store } from "./store/index.js";
import apiService from "./services/apiService.js";

import renderAuth from "./ui/AuthPanel/renderAuth.js";
import renderPlayer from "./ui/Player/renderPlayer.js";
import renderSearch from "./ui/Search/renderSearch.js";
import renderMySongs from "./ui/Player/renderMySongs.js";
import renderRooms from "./ui/Rooms/renderRooms.js";
import renderNotifications from "./ui/Notifications/NotificationPanel.js";

import WorkerFacade from "./services/workerFacade.js";

const facade = new WorkerFacade(store); // 🔥 SOLO UNA VEZ

// RENDERIZAR UI SOLO UNA VEZ
renderAuth(apiService, store);
renderPlayer(store, facade);
renderMySongs();
renderSearch(store);
renderRooms(store, facade);
renderNotifications(store);

const notifSection = document.getElementById("notifications");
notifSection.style.display = "none";

const authPanel = document.getElementById("auth-panel");
const musicApp = document.getElementById("music-app");

// SOLO LOGIN/LOGOUT
function updateUI() {
  const state = store.getState();
  const isLoggedIn = state.auth.status === "succeeded";

  authPanel.style.display = isLoggedIn ? "none" : "block";
  musicApp.style.display = isLoggedIn ? "block" : "none";
  notifSection.style.display = isLoggedIn ? "block" : "none";

  // Renderiza solo notificaciones (seguro)
  renderNotifications(store);
}

// 🔥 SOLO updateUI dentro del subscribe
store.subscribe(updateUI);

updateUI();
