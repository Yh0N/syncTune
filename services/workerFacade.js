// WorkerFacade.js
// -----------------------------------------------------------------------------
// Este archivo implementa el Patrón FACADE.
// -----------------------------------------------------------------------------


import {
  setSearchLoading,
  setSearchSuccess,
  setSearchFailed,
} from "/src/store/searchSlice.js";

import { addNotification } from "/src/store/notificationsSlice.js";

import {
  joinGuest,
  setRoomPlaybackStatus,
  setRoomSong,
} from "/src/store/roomSlice.js";

import {
  playSong,
  pauseSong,
  setSong,
} from "/src/store/playerSlice.js";

import NotificationFactory from "/src/patterns/factory/NotificationFactory.js";


/* ============================================================
   🔰🔰🔰 AQUÍ **EMPIEZA EL PATRÓN FACADE** 🔰🔰🔰
   La clase completa WorkerFacade cumple el rol del Facade.
   Oculta la complejidad de los Web Workers y le da a la UI
   una interfaz simple: startRoom(), hostPlay(), exportPlaylist(), etc.
   ============================================================ */
export default class WorkerFacade {

  constructor(store) {
    // Guardamos el store global
    this.store = store;

    /* =====================================================================
       🔍 SEARCH WORKER  (parte interna del Facade — manejo de worker)
       ===================================================================== */
    this.searchWorker = new Worker(
      new URL("/src/workers/search.worker.js", import.meta.url),
      { type: "module" }
    );

    this.searchWorker.onmessage = (e) => {
      const msg = e.data;

      switch (msg.type) {
        case "SEARCH_SUCCESS":
          this.store.dispatch(setSearchSuccess(msg.results));
          break;

        case "SEARCH_FAILED":
          this.store.dispatch(setSearchFailed());
          this.store.dispatch(
            addNotification({ type: "error", message: msg.error })
          );
          break;
      }
    };


    /* =====================================================================
       🎧 SYNC ROOM WORKER (Observer Pattern dentro del worker)
       Pero WorkerFacade actúa como Facade para la UI.
       ===================================================================== */
    this.syncRoomWorker = new Worker(
      new URL("/src/workers/syncRoom.worker.js", import.meta.url),
      { type: "module" }
    );

    this.syncRoomWorker.onmessage = (e) => {
      const { type, user, songId, status, active, playback, guests } = e.data;

      switch (type) {

        case "ROOM_STARTED":
          this.store.dispatch(
            addNotification({
              type: "info",
              message: "Sala iniciada 🟢",
            })
          );
          break;


        case "ROOM_STATUS":

          if (playback) {
            this.store.dispatch(setRoomPlaybackStatus(playback));
          }

          /* --------------------------------------------------------
             ⭐⭐ AQUÍ SE UTILIZA EL PATRÓN FACTORY ⭐⭐
             NotificationFactory.create() genera el objeto notificación.
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
          this.store.dispatch(setRoomPlaybackStatus("STOPPED"));
          this.store.dispatch(
            addNotification({
              type: "info",
              message: "Sala detenida 🔴",
            })
          );
          break;


        case "GUEST_JOINED":
          this.store.dispatch(joinGuest({ id: Date.now(), name: user }));

          /* ⭐⭐ USO DEL PATRÓN FACTORY ⭐⭐ */
          this.store.dispatch(
            addNotification(
              NotificationFactory.create("GUEST_JOINED", { name: user })
            )
          );
          /* ------- FIN USO FACTORY ------- */

          break;


        case "HOST_CHANGED_SONG": {
          const queue = this.store.getState().player.queue;
          const song = queue.find((s) => s.id == songId);

          this.store.dispatch(setRoomSong(songId));
          this.store.dispatch(setRoomPlaybackStatus("PLAYING"));

          if (song) {
            this.store.dispatch(setSong(song));
            this.store.dispatch(playSong(song));

            /* ⭐⭐ USO DEL PATRÓN FACTORY ⭐⭐ */
            this.store.dispatch(
              addNotification(
                NotificationFactory.create("HOST_CHANGED_SONG", {
                  title: song.title,
                })
              )
            );
            /* ------- FIN USO FACTORY ------- */

          } else {
            /* ⭐⭐ USO DEL PATRÓN FACTORY (fallback) ⭐⭐ */
            this.store.dispatch(
              addNotification(
                NotificationFactory.create("HOST_CHANGED_SONG", {
                  title: "Desconocida",
                })
              )
            );
            /* ------- FIN USO FACTORY ------- */
          }

          break;
        }


        case "ROOM_PLAYBACK":
          this.store.dispatch(setRoomPlaybackStatus(status));

          if (status === "PLAYING") {
            const current = this.store.getState().player.currentSong;
            if (current) this.store.dispatch(playSong(current));

            /* ⭐⭐ USO FACTORY ⭐⭐ */
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PLAY"))
            );
            /* ------- FIN USO FACTORY ------- */
          }

          if (status === "PAUSED") {
            this.store.dispatch(pauseSong());

            /* ⭐⭐ USO FACTORY ⭐⭐ */
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PAUSE"))
            );
            /* ------- FIN USO FACTORY ------- */
          }

          break;


        default:
          console.warn("Evento desconocido:", e.data);
      }
    };


    /* =====================================================================
       📦 EXPORT WORKER (parte interna del Facade)
       ===================================================================== */
    this.exportWorker = new Worker(
      new URL("/src/workers/export.worker.js", import.meta.url),
      { type: "module" }
    );

    this.exportWorker.onmessage = (e) => {
      const { type, blob, error, format } = e.data;

      if (type === "EXPORT_DONE") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `playlist.${format}`;
        a.click();

        this.store.dispatch(
          addNotification({
            type: "success",
            message: "Playlist exportada correctamente 📦",
          })
        );
      }

      if (type === "EXPORT_ERROR") {
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
     Métodos públicos del Facade (lo que la UI realmente usa)
     ===================================================================== */

  startRoom() {
    this.syncRoomWorker.postMessage({ type: "START_ROOM" });
    this.store.dispatch(setRoomPlaybackStatus("ACTIVE"));
  }

  inviteGuest(name) {
    this.syncRoomWorker.postMessage({
      type: "INVITE_GUEST",
      payload: { name },
    });
  }

  hostPlay() {
    this.syncRoomWorker.postMessage({ type: "HOST_PLAY" });
  }

  hostPause() {
    this.syncRoomWorker.postMessage({ type: "HOST_PAUSE" });
  }

  hostChangeSong(songId) {
    this.syncRoomWorker.postMessage({
      type: "HOST_CHANGED_SONG",
      songId,
    });
  }

  exportPlaylist(format = "csv") {
    const queue = this.store.getState().player.queue;

    this.exportWorker.postMessage({
      type: "EXPORT_PLAYLIST",
      songs: queue,
      format,
    });
  }
}
/* ============================================================
   🔰🔰🔰 AQUÍ **TERMINA EL PATRÓN FACADE** 🔰🔰🔰
   ============================================================ */
