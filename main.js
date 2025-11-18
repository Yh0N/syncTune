import { store } from "./store/index.js";
import apiService from "./services/apiService.js";

import renderAuth from "./ui/AuthPanel/renderAuth.js";
import renderPlayer from "./ui/Player/renderPlayer.js";
import renderSearch from "./ui/Search/renderSearch.js";
import renderMySongs from "./ui/Player/renderMySongs.js";
import renderRooms from "./ui/Rooms/renderRooms.js";
import renderNotifications from "./ui/Notifications/NotificationPanel.js";

import WorkerFacade from "./services/workerFacade.js";

const facade = new WorkerFacade(store);

// ========================
// INIT UI
// ========================
renderAuth(apiService, store);
renderPlayer(store, facade);
renderMySongs();  // 🔥 PANEL FIJO DE TUS CANCIONES
renderSearch(store);
renderRooms(store, facade);

// NOTIFICACIONES: Inicialmente ocultas
const notifSection = document.getElementById("notifications");
notifSection.style.display = "none";
renderNotifications(store);

// ========================
// PANEL DE AUTENTICACIÓN / APP PRINCIPAL
// ========================
const authPanel = document.getElementById("auth-panel");
const musicApp = document.getElementById("music-app");

// Función para actualizar UI según estado de login
function updateUI() {
  const state = store.getState();
  const isLoggedIn = state.auth.status === "succeeded";

  authPanel.style.display = isLoggedIn ? "none" : "block";
  musicApp.style.display = isLoggedIn ? "block" : "none";

  // Mostrar notificaciones solo si está logueado
  notifSection.style.display = isLoggedIn ? "block" : "none";
}

// Suscribirse a cambios del store
store.subscribe(updateUI);

// Llamada inicial para reflejar estado al cargar la página
updateUI();
