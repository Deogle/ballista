import { getLighthouseReport } from "./lighthouse-util.js";
import { parentPort, workerData } from "worker_threads";

(async () => {
  const { url, auditTypes, id } = workerData;
  const report = await getLighthouseReport(url, auditTypes);
  parentPort.postMessage({ report, url, id });
})();
