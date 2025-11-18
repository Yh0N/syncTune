import WorkerFacade from "./workerFacade.js";
import { store } from "../store/index.js";

const facade = new WorkerFacade(store);
export default facade;
