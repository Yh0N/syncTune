// 🧠 Worker de análisis de audio (Simulación BPM)

self.onmessage = async (e) => {
  const { type, arrayBuffer, fileName } = e.data;

  // Solo procesamos mensajes tipo ANALYZE_AUDIO
  if (type !== "ANALYZE_AUDIO") return;

  try {
    // ---------------------------------------------------------
    //  Simulación de tarea pesada
    // En un caso real: análisis FFT, ondas, beats, energía...
    // Aquí solo generamos carga para demostrar multithreading.
    // ---------------------------------------------------------
    let fakeProgress = 0;

    for (let i = 0; i < 10_000_000; i++) {
      fakeProgress += i % 7; // loop grande para simular trabajo
    }

    // ---------------------------------------------------------
    // 🎶 Simulación de un BPM entre 80 y 140
    // ---------------------------------------------------------
    const bpm = Math.floor(80 + Math.random() * 60);

    // ---------------------------------------------------------
    // 🎧 Crear preview del audio usando un Blob temporal
    // ---------------------------------------------------------
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const previewUrl = URL.createObjectURL(blob);

    // ---------------------------------------------------------
    // Enviamos de vuelta un objeto canción
    // simulando haberla analizado realmente.
    // ---------------------------------------------------------
    self.postMessage({
      type: "ANALYSIS_DONE",
      song: {
        id: Date.now(),
        title: fileName.replace(/\.[^/.]+$/, ""), // nombre sin extensión
        bpm,
        preview: previewUrl,
        local: true,
      },
    });

  } catch (err) {

    // Si algo sale mal → devolvemos error
    self.postMessage({
      type: "ANALYSIS_ERROR",
      error: err.message,
    });
  }
};
