// export.worker.js
// Exporta la playlist SIN solicitar nada a iTunes (usa los datos locales)

self.onmessage = async (e) => {
  const { type, songs, format } = e.data;

  if (type !== "EXPORT_PLAYLIST") return;

  try {
    // CSV
    if (format === "csv") {
      const header = "id,title,artist,album,preview\n";

      const rows = songs
        .map(
          (s) =>
            `${s.id},"${s.title}","${s.artist ?? ""}","${s.album ?? ""}",${s.preview}`
        )
        .join("\n");

      const blob = new Blob([header + rows], { type: "text/csv" });

      self.postMessage({
        type: "EXPORT_DONE",
        blob,
        format,
      });

      return;
    }

    // JSON
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
    self.postMessage({
      type: "EXPORT_ERROR",
      error: err.message,
    });
  }
};
