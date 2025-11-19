// WorkerFacade.js
// -----------------------------------------------------------------------------
// Clase que actúa como FACADE entre la UI, Redux y varios Web Workers.
// -----------------------------------------------------------------------------


import {
  setSearchLoading,
  setSearchSuccess,
  setSearchFailed,
} from "/src/store/searchSlice.js";
// -> Importa acciones (reducers) del slice de búsqueda para actualizar el store
//    cuando el worker de búsqueda devuelve resultados / error.

import { addNotification } from "/src/store/notificationsSlice.js";
// -> Acción para agregar una notificación al estado global.

import {
  joinGuest,
  setRoomPlaybackStatus,
  setRoomSong,
} from "/src/store/roomSlice.js";
// -> Acciones para actualizar el estado de la sala (invitados, playback, canción).

import {
  playSong,
  pauseSong,
  setSong,
} from "/src/store/playerSlice.js";
// -> Acciones del reproductor: reproducir, pausar y establecer canción actual.

import NotificationFactory from "/src/patterns/factory/NotificationFactory.js";
// -> Fábrica que construye objetos de notificación estandarizados
//    (patrón Factory).

/* ============================================================
   AQUÍ EMPIEZA EL PATRÓN FACADE: la clase WorkerFacade
   ============================================================ */
export default class WorkerFacade {

  constructor(store) {
    // Guardamos la referencia al store de Redux para despachar acciones luego.
    this.store = store;

    /* =====================================================================
       SEARCH WORKER — inicializamos y configuramos su handler
       ===================================================================== */
    this.searchWorker = new Worker(
      new URL("/src/workers/search.worker.js", import.meta.url),
      { type: "module" }
    );
    // -> Crea un Web Worker que ejecuta search.worker.js (módulo ESM).

    this.searchWorker.onmessage = (e) => {
      const msg = e.data;
      // -> Cuando el worker manda un mensaje, lo recibimos aquí.
      //    msg tiene forma { type: "...", ... }

      switch (msg.type) {
        case "SEARCH_SUCCESS":
          // -> Si la búsqueda fue exitosa, despachamos la acción que guarda resultados.
          this.store.dispatch(setSearchSuccess(msg.results));
          break;

        case "SEARCH_FAILED":
          // -> Si falló la búsqueda, actualizamos el estado y mostramos notificación de error.
          this.store.dispatch(setSearchFailed());
          this.store.dispatch(
            addNotification({ type: "error", message: msg.error })
          );
          break;
      }
    };


    /* =====================================================================
       SYNC ROOM WORKER — worker que simula/sincroniza la "sala"
       ===================================================================== */
    this.syncRoomWorker = new Worker(
      new URL("/src/workers/syncRoom.worker.js", import.meta.url),
      { type: "module" }
    );
    // -> Worker que emite eventos de sala (ROOM_STARTED, GUEST_JOINED, etc.)

    this.syncRoomWorker.onmessage = (e) => {
      // -> Manejador central de mensajes que vienen del worker de sala.
      const { type, user, songId, status, active, playback, guests } = e.data;

      switch (type) {

        case "ROOM_STARTED":
          // -> Notificar que la sala se inició (simple notificación).
          this.store.dispatch(
            addNotification({
              type: "info",
              message: "Sala iniciada 🟢",
            })
          );
          break;


        case "ROOM_STATUS":
          // -> Mensaje con snapshot del estado de la sala.
          //    Si incluye playback, actualizamos ese estado en el slice de room.
          if (playback) {
            this.store.dispatch(setRoomPlaybackStatus(playback));
          }

          /* --------------------------------------------------------
             USO DEL PATRÓN FACTORY:
             NotificationFactory.create("ROOM_STATUS", {...})
             crea un objeto notificación estandarizado.
             Luego lo pasamos a addNotification para guardarlo en Redux.
             -------------------------------------------------------- */
          this.store.dispatch(
            addNotification(
              NotificationFactory.create("ROOM_STATUS", {
                active,
                playback,
                guestsCount: guests?.length ?? 0,
              })
            )
          );
          /* ------- FIN USO FACTORY ------- */
          break;


        case "ROOM_STOPPED":
          // -> Sala detenida: actualizamos estado y mostramos notificación.
          this.store.dispatch(setRoomPlaybackStatus("STOPPED"));
          this.store.dispatch(
            addNotification({
              type: "info",
              message: "Sala detenida 🔴",
            })
          );
          break;


        case "GUEST_JOINED":
          // -> Agregamos al invitado al estado de la sala (joinGuest espera {id,name})
          this.store.dispatch(joinGuest({ id: Date.now(), name: user }));

          /* USO DEL PATRÓN FACTORY para construir la notificación del invitado */
          this.store.dispatch(
            addNotification(
              NotificationFactory.create("GUEST_JOINED", { name: user })
            )
          );
          /* ------- FIN USO FACTORY ------- */

          break;


        case "HOST_CHANGED_SONG": {
          // -> El host cambió la canción: recibimos songId del worker.
          //    Buscamos en la cola local (store) la canción con ese id.
          const queue = this.store.getState().player.queue;
          const song = queue.find((s) => s.id == songId);

          // -> Guardar en roomSlice qué canción está seleccionada por el host
          this.store.dispatch(setRoomSong(songId));
          // -> Marcar playback del room como PLAYING
          this.store.dispatch(setRoomPlaybackStatus("PLAYING"));

          if (song) {
            // -> Si la canción existe en la cola local: sincronizar reproductor local
            this.store.dispatch(setSong(song)); // set currentSong
            this.store.dispatch(playSong(song)); // marcar playing

            /* USO DEL PATRÓN FACTORY: notificar cambio de canción por host */
            this.store.dispatch(
              addNotification(
                NotificationFactory.create("HOST_CHANGED_SONG", {
                  title: song.title,
                })
              )
            );
            /* ------- FIN USO FACTORY ------- */

          } else {
            // -> Fallback si el songId no está en la cola local:
            this.store.dispatch(
              addNotification(
                NotificationFactory.create("HOST_CHANGED_SONG", {
                  title: "Desconocida",
                })
              )
            );
          }

          break;
        }


        case "ROOM_PLAYBACK":
          // -> Cambio de estado global de reproducción (PLAYING / PAUSED)
          this.store.dispatch(setRoomPlaybackStatus(status));

          if (status === "PLAYING") {
            // -> Si el room indica PLAYING, hacemos play local si hay canción
            const current = this.store.getState().player.currentSong;
            if (current) this.store.dispatch(playSong(current));

            /* USO FACTORY: notificación "HOST_PLAY" */
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PLAY"))
            );
            /* FIN USO FACTORY */
          }

          if (status === "PAUSED") {
            // -> Si el room indica PAUSED, pausamos localmente
            this.store.dispatch(pauseSong());

            /* USO FACTORY: notificación "HOST_PAUSE" */
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PAUSE"))
            );
            /* FIN USO FACTORY */
          }

          break;


        default:
          // -> Evento desconocido desde el worker: lo logueamos
          console.warn("Evento desconocido:", e.data);
      }
    };


    /* =====================================================================
       EXPORT WORKER — worker que genera Blob con CSV/JSON y lo retorna
       ===================================================================== */
    this.exportWorker = new Worker(
      new URL("/src/workers/export.worker.js", import.meta.url),
      { type: "module" }
    );
    // -> Worker que recibe una lista de canciones y devuelve un Blob.

    this.exportWorker.onmessage = (e) => {
      // -> Manejador para cuando el worker termina o falla la exportación
      const { type, blob, error, format } = e.data;

      if (type === "EXPORT_DONE") {
        // -> Si se generó el Blob correctamente, creamos un enlace temporal
        //    para forzar la descarga en el navegador.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `playlist.${format}`;
        a.click();

        // -> Notificación de éxito
        this.store.dispatch(
          addNotification({
            type: "success",
            message: "Playlist exportada correctamente 📦",
          })
        );
      }

      if (type === "EXPORT_ERROR") {
        // -> Notificación de error
        this.store.dispatch(
          addNotification({
            type: "error",
            message: "Error exportando playlist ❌",
          })
        );
      }
    };
  }


  /* =====================================================================
     MÉTODOS PÚBLICOS expuestos por el Facade — la UI los llama
     ===================================================================== */

  startRoom() {
    // -> Indica al worker que inicie la sala
    this.syncRoomWorker.postMessage({ type: "START_ROOM" });
    // -> Actualiza el estado local (roomSlice) para marcar sala activa
    this.store.dispatch(setRoomPlaybackStatus("ACTIVE"));
  }

  inviteGuest(name) {
    // -> Enviar petición al worker para invitar un invitado con nombre
    this.syncRoomWorker.postMessage({
      type: "INVITE_GUEST",
      payload: { name },
    });
  }

  hostPlay() {
    // -> Envia evento al worker: host presionó PLAY
    this.syncRoomWorker.postMessage({ type: "HOST_PLAY" });
  }

  hostPause() {
    // -> Envia evento al worker: host presionó PAUSE
    this.syncRoomWorker.postMessage({ type: "HOST_PAUSE" });
  }

  hostChangeSong(songId) {
    // -> Indicar al worker que el host cambió la canción
    this.syncRoomWorker.postMessage({
      type: "HOST_CHANGED_SONG",
      songId,
    });
  }

  exportPlaylist(format = "csv") {
    // -> Recuperar la cola actual desde el store
    const queue = this.store.getState().player.queue;

    // -> Pedir al worker que genere el archivo (CSV o JSON).
    //    Se le envía la lista completa de canciones (objetos).
    this.exportWorker.postMessage({
      type: "EXPORT_PLAYLIST",
      songs: queue,
      format,
    });
  }
}
/* ============================================================
   AQUÍ TERMINA EL PATRÓN FACADE (WorkerFacade)
   ============================================================ */
