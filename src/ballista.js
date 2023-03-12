import path from "path";
import { BatchQueue } from "./util/batch-queue";
const WORKER_PATH = path.join(__dirname, "worker", "lighthouse-worker.js");

class Ballista {
  constructor(options) {
    const {
      batchSize,
      urlList,
      metricList,
      iterations,
      outputWriter,
      onBatchProcessed,
    } = options;

    this.urlList = urlList;
    this.reportList = urlList.forEach((url) => (reportList[url] = []));
    this.queue = new BatchQueue();
    this.batchSize = batchSize;
    this.iterations = iterations;
    this.metricList = metricList;
    this.outputWriter = outputWriter;
    this.onBatchProcessed = onBatchProcessed;
  }

  handleWorkerSuccess({ url, report, id }) {
    if (!report) throw new Error(`Failed to get report for ${url}`);
    this.reportList[url].push(report);
  }

  spawnWorker(url, id) {
    const workerData = {
      url,
      id: id,
      metricList: this.metricList.map((metric) => metric.path),
    };

    return new Promise((resolve) => {
      const worker = new Worker(WORKER_PATH, { workerData });
      worker.on("message", (data) => {
        resolve(handleWorkerSuccess(data));
      });
    });
  }

  init() {
    for (const url of this.urlList) {
      for (let i = 0; i < this.iterations; i++) {
        this.queue.enqueue(() => spawnWorker(url, i));
      }
    }
    this.queue.processQueue({
      batchSize: this.batchSize,
      onBatchProcessed: () => this.onBatchProcessed(),
      onExit: () => this.handleReportsProcessed(),
    });
  }
}
