// strategyMap.js
// ----------------
// Mapa que asocia un nombre de estrategia con su instancia.
// Permite seleccionar dinámicamente la forma de avanzar canciones
// sin necesidad de usar condicionales en el reproductor.

// Importamos cada estrategia por separado
import LinearStrategy from "./LinearStrategy.js";
import ShuffleStrategy from "./ShuffleStrategy.js";
import LoopStrategy from "./LoopStrategy.js";

// Exportamos un objeto que contiene las estrategias disponibles.
// El playerSlice utiliza estas claves para seleccionar la lógica
// de reproducción correspondiente.
export const strategies = {
  LINEAR: new LinearStrategy(), // Reproducción normal
  SHUFFLE: new ShuffleStrategy(), // Aleatoria
  LOOP: new LoopStrategy(), // Repetir canción
};
