// 📦 export.worker.js
// Exporta playlist a CSV o JSON usando iTunes API

self.onmessage = async (e) => {
  const { type, songIds, format } = e.data;

  if (type !== "EXPORT_PLAYLIST") return;

  try {
    // Fetch masivo usando Promise.all
    const results = await Promise.all(
      songIds.map(async (id) => {
        const res = await fetch(
          `https://itunes.apple.com/lookup?id=${id}`
        );

        const data = await res.json();
        const song = data.results[0];

        return {
          id: song.trackId,
          title: song.trackName,
          artist: song.artistName,
          album: song.collectionName,
          duration: song.trackTimeMillis,
          preview: song.previewUrl,
        };
      })
    );

    // Convertir a CSV
    if (format === "csv") {
      const header =
        "id,title,artist,album,duration(ms),preview\n";

      const rows = results
        .map(
          (s) =>
            `${s.id},"${s.title}","${s.artist}","${s.album}",${s.duration},${s.preview}`
        )
        .join("\n");

      const blob = new Blob([header + rows], {
        type: "text/csv",
      });

      self.postMessage({
        type: "EXPORT_DONE",
        blob,
        format,
      });

      return;
    }

    // Convertir a JSON
    if (format === "json") {
      const json = JSON.stringify(results, null, 2);

      const blob = new Blob([json], {
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
