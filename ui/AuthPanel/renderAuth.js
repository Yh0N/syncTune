// src/ui/AuthPanel/renderAuth.js
// ---------------------------------------------------------------------------
// Módulo encargado de la interfaz de autenticación.
//
// Funcionalidades:
//   Captura usuario y contraseña desde el formulario
//   Llama a apiService.login() para iniciar sesión
//   Llama a apiService.logout() para cerrar sesión
//   Conecta con Redux a través de apiService
//
// Este módulo NO maneja Redux directamente, sino a través del servicio.
// ---------------------------------------------------------------------------

import apiService from "/src/services/apiService.js";
import { store } from "/src/store/index.js";
import { addNotification } from "/src/store/notificationsSlice.js";

export default function renderAuth() {
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  // ------------------------------------------------------------
  // 📌 LOGIN
  // Capturamos evento submit del formulario
  // ------------------------------------------------------------
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener valores del form
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    console.log("Enviando:", username, password);

    try {
      // Usamos apiService que maneja Redux internamente
      await apiService.login(username, password);
    } catch (err) {
      console.error("Login error:", err);
    }
  });

  // ------------------------------------------------------------
  // 📌 LOGOUT
  // Botón de cierre de sesión
  // ------------------------------------------------------------
  logoutBtn.addEventListener("click", () => {
    apiService.logout();
  });
}
