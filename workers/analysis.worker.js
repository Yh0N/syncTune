// 🧠 Worker de análisis de audio (Simulación BPM)

self.onmessage = async (e) => {
  const { type, arrayBuffer, fileName } = e.data;

  if (type !== "ANALYZE_AUDIO") return;

  try {
    // ---------------------------------------------
    // Simular una tarea pesada
    // (Esto normalmente analizaría frecuencias, FFT...)
    // ---------------------------------------------
    let fakeProgress = 0;

    for (let i = 0; i < 10_000_000; i++) {
      fakeProgress += i % 7;
    }

    // Simular BPM
    const bpm = Math.floor(80 + Math.random() * 60); // 80–140 BPM

    // Crear URL para reproducir el MP3
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const previewUrl = URL.createObjectURL(blob);

    // Resultado simulado
    self.postMessage({
      type: "ANALYSIS_DONE",
      song: {
        id: Date.now(),
        title: fileName.replace(/\.[^/.]+$/, ""),
        bpm,
        preview: previewUrl,
        local: true,
      },
    });
  } catch (err) {
    self.postMessage({
      type: "ANALYSIS_ERROR",
      error: err.message,
    });
  }
};
