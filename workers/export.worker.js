// export.worker.js
// ---------------------------------------------------------------------------
// Worker encargado de EXPORTAR la playlist a formatos CSV o JSON.
// No depende de iTunes ni servicios externos. Usa los datos locales.
// ---------------------------------------------------------------------------

self.onmessage = async (e) => {
  const { type, songs, format } = e.data;

  // Acepta únicamente mensajes EXPORT_PLAYLIST
  if (type !== "EXPORT_PLAYLIST") return;

  try {
    // ---------------------------------------------------------
    // 📄 Exportación CSV
    // ---------------------------------------------------------
    if (format === "csv") {
      const header = "id,title,artist,album,preview\n";

      // Ensamblamos filas del CSV
      const rows = songs
        .map(
          (s) =>
            `${s.id},"${s.title}","${s.artist ?? ""}","${s.album ?? ""}",${s.preview}`
        )
        .join("\n");

      // Crear Blob final del CSV
      const blob = new Blob([header + rows], { type: "text/csv" });

      // Enviamos resultado al main thread
      self.postMessage({
        type: "EXPORT_DONE",
        blob,
        format,
      });

      return;
    }

    // ---------------------------------------------------------
    // 🟦 Exportación JSON
    // ---------------------------------------------------------
    if (format === "json") {
      const blob = new Blob([JSON.stringify(songs, null, 2)], {
        type: "application/json",
      });

      self.postMessage({
        type: "EXPORT_DONE",
        blob,
        format,
      });

      return;
    }

  } catch (err) {
    // Error al exportar
    self.postMessage({
      type: "EXPORT_ERROR",
      error: err.message,
    });
  }
};
