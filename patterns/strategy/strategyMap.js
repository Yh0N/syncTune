import LinearStrategy from "./LinearStrategy.js";
import ShuffleStrategy from "./ShuffleStrategy.js";
import LoopStrategy from "./LoopStrategy.js";

export const strategies = {
  LINEAR: new LinearStrategy(),
  SHUFFLE: new ShuffleStrategy(),
  LOOP: new LoopStrategy(),
};
