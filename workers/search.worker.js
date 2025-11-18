// src/workers/search.worker.js
// ---------------------------------------------------------------------------
// Worker especializado en búsquedas musicales en la API de Deezer.
// Realiza fetch sin bloquear la UI principal.
// ---------------------------------------------------------------------------

self.onmessage = async (e) => {
  const query = e.data.query;

  try {
    // Realizamos búsqueda en Deezer
    const res = await fetch(`https://api.deezer.com/search?q=${query}`);
    const data = await res.json();

    // Deezer devuelve: { data: [ ...songs ] }
    postMessage({
      type: "SEARCH_SUCCESS",
      results: data.data
    });

  } catch (err) {

    // Error de red o de parsing
    postMessage({
      type: "SEARCH_FAILED",
      error: err.message
    });
  }
};
