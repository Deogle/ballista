import { getLighthouseReport } from "./lighthouse-runner.js";
import { parentPort, workerData } from "worker_threads";

(async () => {
  const { url, id, isDesktopMode } = workerData;
  
  const report = await getLighthouseReport(url, isDesktopMode);
  
  parentPort.postMessage({ report, url, id });
})();
