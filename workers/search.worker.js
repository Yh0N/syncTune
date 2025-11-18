// src/workers/search.worker.js
self.onmessage = async (e) => {
  const query = e.data.query;

  try {
    const res = await fetch(`https://api.deezer.com/search?q=${query}`);
    const data = await res.json();

    postMessage({
      type: "SEARCH_SUCCESS",
      results: data.data // Deezer devuelve { data: [...] }
    });
  } catch (err) {
    postMessage({
      type: "SEARCH_FAILED",
      error: err.message
    });
  }
};
