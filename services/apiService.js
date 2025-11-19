// src/services/apiService.js

// Importa el store de Redux para poder despachar acciones desde este servicio.
import { store } from "/src/store/index.js";

// Importa acciones del slice de auth para actualizar estado de login/logout.
import {
  setLoginLoading,
  setLoginSuccess,
  setLoginFailed,
  setLogout,
} from "/src/store/authSlice.js";

// Acción para agregar notificaciones al estado global.
import { addNotification } from "/src/store/notificationsSlice.js";

// Acciones del player para cargar cola y canción actual desde este servicio.
import { setQueue, setSong } from "/src/store/playerSlice.js";

/*
  ApiService
  ---------------------------------------------------------
  Servicio Singleton responsable de:
  - Manejar autenticación (login/logout)
  - Simular carga de playlists y canciones
  - Orquestar el flujo de promesas anidadas
  - Despachar acciones síncronas a Redux
*/

class ApiService {

  /* ============================================================
     AQUÍ EMPIEZA EL PATRÓN SINGLETON
     ============================================================ */
  constructor() {
    // Si ya existe una instancia previa, la retornamos (evita duplicación).
    if (ApiService.instance) return ApiService.instance;

    // URL base de la API falsa FakeStore.
    this.baseUrl = "https://fakestoreapi.com";

    // Token en memoria usado para simular que la sesión está activa.
    this.token = null;

    // Guardamos esta instancia para usarla siempre.
    ApiService.instance = this;
  }
  /* ============================================================
     AQUÍ TERMINA EL PATRÓN SINGLETON
     ============================================================ */

  // ======================================================
  // LOGIN (POST /auth/login)
  // ======================================================
  async login(username, password) {
    try {
      // Cambio en Redux: login está cargando.
      store.dispatch(setLoginLoading());

      // Envío de solicitud POST a FakeStoreAPI.
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Credenciales en el body
      });

      // Convertimos la respuesta a JSON.
      const data = await res.json();
      console.log("RAW RESPONSE:", data);

      // Validamos si la API devolvió un token correcto.
      if (!res.ok || !data.token) {
        const errorMsg = data.error || data.message || "Login fallido";

        // Informamos en Redux que falló.
        store.dispatch(setLoginFailed());

        // Mostramos notificación en UI.
        store.dispatch(addNotification({ type: "error", message: errorMsg }));

        // Lanzamos el error para detener flujo.
        throw new Error(errorMsg);
      }

      // Guardamos token en la instancia (simulación de sesión).
      this.token = data.token;

      // Informamos a Redux que el login fue exitoso.
      store.dispatch(
        setLoginSuccess({
          token: data.token,     // Token recibido
          user: { username },    // FakeStore no retorna info del usuario
        })
      );

      // Notificación de éxito.
      store.dispatch(
        addNotification({
          type: "success",
          message: "Inicio de sesión exitoso",
        })
      );

      // Retornamos la data al llamador.
      return data;

    } catch (err) {
      // En cualquier error, actualizamos el estado global.
      store.dispatch(setLoginFailed());

      // Notificación de error.
      store.dispatch(
        addNotification({
          type: "error",
          message: err.message || "Error login",
        })
      );

      // Re-lanzamos el error.
      throw err;
    }
  }

  // ======================================================
  // Flujo de promesas anidadas después del login
  // ======================================================
  async loadUserData() {
    try {
      console.log("Cargando playlists (carts)...");

      // 1) Obtenemos todos los carritos (simulan playlists).
      const cartsRes = await fetch(`${this.baseUrl}/carts`);
      const cartsData = await cartsRes.json();

      // Validamos que existan carritos.
      if (!cartsRes.ok || !cartsData?.length) {
        throw new Error("No se pudieron cargar las playlists");
      }

      // Tomamos el primer carrito como playlist.
      const firstCartId = cartsData[0].id;
      console.log("Playlist encontrada:", firstCartId);

      // 2) Cargamos el contenido de ese carrito.
      const cartRes = await fetch(`${this.baseUrl}/carts/${firstCartId}`);
      const cartData = await cartRes.json();

      // Validamos si tiene productos.
      if (!cartRes.ok || !cartData.products?.length) {
        throw new Error("No se pudieron cargar las canciones de la playlist");
      }

      // 3) Seleccionamos la primera canción del carrito.
      const firstSongId = cartData.products[0].productId;
      console.log("Primera canción:", firstSongId);

      // 4) Obtenemos el detalle de la canción.
      const songRes = await fetch(`${this.baseUrl}/products/${firstSongId}`);
      const songDetail = await songRes.json();

      // Validación de detalles obtenidos.
      if (!songRes.ok || !songDetail) {
        throw new Error("No se pudo cargar el detalle de la canción");
      }

      console.log("Flujo de promesas completado");

      // Enviamos al store la playlist completa.
      store.dispatch(setQueue(cartData.products));

      // Enviamos la canción seleccionada.
      store.dispatch(setSong(songDetail));

      // Notificación de éxito.
      store.dispatch(
        addNotification({
          type: "success",
          message: "Playlist y canción cargadas",
        })
      );

    } catch (err) {
      console.error("Error en carga post-login:", err);

      // Notificamos error sin detener UI.
      store.dispatch(
        addNotification({
          type: "error",
          message: err.message || "Error post-login",
        })
      );
    }
  }

  // ======================================================
  // LOGOUT
  // ======================================================
  logout() {
    // Borramos token en memoria.
    this.token = null;

    // Cambiamos estado global a "no autenticado".
    store.dispatch(setLogout());

    // Notificación informativa.
    store.dispatch(
      addNotification({
        type: "info",
        message: "Sesión cerrada",
      })
    );
  }
}

// Instancia única del Singleton.
const apiService = new ApiService();

// Exportamos instancia ya creada.
export default apiService;
