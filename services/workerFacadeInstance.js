// workerFacadeInstance.js
// -----------------------------------------------------------------------------
// Este archivo crea una única instancia del WorkerFacade y la exporta.
//
// Ventajas:
//  Evita múltiples instancias del Façade
//  La app entera usa el MISMO canal de comunicación con los Workers
// -----------------------------------------------------------------------------

import WorkerFacade from "./workerFacade.js";
import { store } from "../store/index.js";

// Se crea una instancia ÚNICA que controla:
//  - searchWorker
//  - syncRoomWorker
//  - exportWorker
const facade = new WorkerFacade(store);

export default facade;
