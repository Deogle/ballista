import { getLighthouseReport } from "./lighthouse-runner.js";
import { parentPort, workerData } from "worker_threads";

(async () => {
  const { url, metricList, id } = workerData;
  const report = await getLighthouseReport(url, metricList);
  parentPort.postMessage({ report, url, id });
})();
