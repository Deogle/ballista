import { getLighthouseReport } from "./lighthouse-runner.js";
import { parentPort, workerData } from "worker_threads";

(async () => {
  const { url, id } = workerData;
  
  const report = await getLighthouseReport(url);
  
  parentPort.postMessage({ report, url, id });
})();
