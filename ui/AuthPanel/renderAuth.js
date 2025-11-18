// src/ui/AuthPanel/renderAuth.js
import apiService from "/src/services/apiService.js";
import { store } from "/src/store/index.js";
import { addNotification } from "/src/store/notificationsSlice.js";

export default function renderAuth() {
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    console.log("Enviando:", username, password);

    try {
      await apiService.login(username, password);
    } catch (err) {
      console.error("Login error:", err);
    }
  });

  logoutBtn.addEventListener("click", () => {
    apiService.logout();
  });
}
