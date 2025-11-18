// src/services/apiService.js
import { store } from "/src/store/index.js";
import {
  setLoginLoading,
  setLoginSuccess,
  setLoginFailed,
  setLogout,
} from "/src/store/authSlice.js";
import { addNotification } from "/src/store/notificationsSlice.js";
import { setQueue, setSong } from "/src/store/playerSlice.js";

class ApiService {
  constructor() {
    if (ApiService.instance) return ApiService.instance;
    this.baseUrl = "https://fakestoreapi.com";
    this.token = null;
    ApiService.instance = this;
  }

  // 🔐 LOGIN CON FakeStoreAPI
  async login(username, password) {
    try {
      store.dispatch(setLoginLoading());

      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log("RAW RESPONSE:", data);

      if (!res.ok || !data.token) {
        const errorMsg = data.error || data.message || "Login fallido ❌";
        store.dispatch(setLoginFailed());
        store.dispatch(addNotification({ type: "error", message: errorMsg }));
        throw new Error(errorMsg);
      }

      this.token = data.token;

      store.dispatch(
        setLoginSuccess({
          token: data.token,
          user: { username }, // FakeStore no devuelve ID, simulamos con username
        })
      );

      store.dispatch(
        addNotification({ type: "success", message: "Inicio de sesión exitoso ✅" })
      );

      return data;
    } catch (err) {
      store.dispatch(setLoginFailed());
      store.dispatch(
        addNotification({ type: "error", message: err.message || "Error login" })
      );
      throw err;
    }
  }

  // 🔄 Flujo de carga post-login (simulación de playlists y canciones)
  async loadUserData() {
    try {
      console.log("🔐 Cargando playlists (carts)...");

      // FakeStore no tiene /users/{id}/carts, usamos /carts global
      const cartsRes = await fetch(`${this.baseUrl}/carts`);
      const cartsData = await cartsRes.json();

      if (!cartsRes.ok || !cartsData?.length) {
        throw new Error("No se pudieron cargar las playlists");
      }

      const firstCartId = cartsData[0].id;
      console.log("🎶 Playlist encontrada:", firstCartId);

      const cartRes = await fetch(`${this.baseUrl}/carts/${firstCartId}`);
      const cartData = await cartRes.json();

      if (!cartRes.ok || !cartData.products?.length) {
        throw new Error("No se pudieron cargar las canciones de la playlist");
      }

      const firstSongId = cartData.products[0].productId;
      console.log("🎧 Primera canción:", firstSongId);

      const songRes = await fetch(`${this.baseUrl}/products/${firstSongId}`);
      const songDetail = await songRes.json();

      if (!songRes.ok || !songDetail) {
        throw new Error("No se pudo cargar el detalle de la canción");
      }

      console.log("✅ ¡Flujo de promesas anidadas completado!");

      store.dispatch(setQueue(cartData.products));
      store.dispatch(setSong(songDetail));

      store.dispatch(
        addNotification({ type: "success", message: "Playlist y canción cargadas 🎵" })
      );
    } catch (err) {
      console.error("Error en carga post-login:", err);
      store.dispatch(
        addNotification({ type: "error", message: err.message || "Error post-login" })
      );
    }
  }

  // 🚪 LOGOUT
  logout() {
    this.token = null;
    store.dispatch(setLogout());
    store.dispatch(
      addNotification({ type: "info", message: "Sesión cerrada 🚪" })
    );
  }
}

const apiService = new ApiService();
export default apiService;
