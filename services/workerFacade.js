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

export default class WorkerFacade {
  constructor(store) {
    this.store = store;

    /* ----------------------------------------
       🔍 SEARCH WORKER
    ---------------------------------------- */
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

    /* ----------------------------------------
       🎧 SYNC ROOM WORKER
    ---------------------------------------- */
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
          // Actualiza estado global de la sala
          if (playback) {
            this.store.dispatch(setRoomPlaybackStatus(playback));
          }
          // Notificación con snapshot de la sala
          this.store.dispatch(
            addNotification(
              NotificationFactory.create("ROOM_STATUS", {
                active,
                playback,
                guestsCount: guests?.length ?? 0,
              })
            )
          );
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
          this.store.dispatch(
            addNotification(
              NotificationFactory.create("GUEST_JOINED", { name: user })
            )
          );
          break;

        case "HOST_CHANGED_SONG": {
          const queue = this.store.getState().player.queue;
          const song = queue.find((s) => s.id == songId);

          this.store.dispatch(setRoomSong(songId));
          this.store.dispatch(setRoomPlaybackStatus("PLAYING"));

          if (song) {
            this.store.dispatch(setSong(song));
            this.store.dispatch(playSong(song));
            this.store.dispatch(
              addNotification(
                NotificationFactory.create("HOST_CHANGED_SONG", {
                  title: song.title,
                })
              )
            );
          } else {
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
          this.store.dispatch(setRoomPlaybackStatus(status));

          if (status === "PLAYING") {
            const current = this.store.getState().player.currentSong;
            if (current) this.store.dispatch(playSong(current));
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PLAY"))
            );
          }

          if (status === "PAUSED") {
            this.store.dispatch(pauseSong());
            this.store.dispatch(
              addNotification(NotificationFactory.create("HOST_PAUSE"))
            );
          }


          break;

        default:
          // Ya no debería aparecer, pero mantenemos el log por seguridad
          console.warn("Evento desconocido:", e.data);
      }
    };

    /* ----------------------------------------
       📦 EXPORT PLAYLIST WORKER
    ---------------------------------------- */
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

  /* ----------------------------------------
     Métodos públicos
  ---------------------------------------- */
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

  exportPlaylist(songIds, format = "csv") {
    this.exportWorker.postMessage({
      type: "EXPORT_PLAYLIST",
      songIds,
      format,
    });
  }
}
