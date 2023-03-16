import path from "path";
import { BatchQueue } from "./util/batch-queue.js";
import { Worker } from "worker_threads";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { averageValue, getReportProperty } from "./util/utils.js";
import chromeLauncher from "chrome-launcher";

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORKER_PATH = path.join(__dirname, "worker", "lighthouse-worker.js");

class Ballista {
  constructor({
    batchSize,
    urlList,
    metricList,
    iterations,
    outputWriter,
    onBatchProcessed,
  }) {
    this.urlList = urlList;
    this.reportList = urlList.reduce((prev, curr) => {
      prev[curr] = [];
      return prev;
    }, {});

    this.batchSize = batchSize || 10;
    this.iterations = iterations || 10;
    this.metricList = metricList;
    this.outputWriter = outputWriter;
    this.onBatchProcessed = onBatchProcessed;

    this.queue = new BatchQueue({
      batchSize: this.batchSize,
      onBatchProcessed: this.onBatchProcessed,
      onExit: this.handleReportsProcessed.bind(this),
    });
  }

  async handleReportsProcessed() {
    chromeLauncher.killAll();
    let averagedReports = Object.keys(this.reportList).reduce(
      (prevObj, url) => {
        prevObj[url] = {};
        return prevObj;
      },
      {}
    );

    for (const metric of this.metricList) {
      Object.entries(this.reportList).forEach(([url, report]) => {
        const reportAvg = averageValue(report, metric.name);
        averagedReports[url][metric.displayName] = metric.toString(reportAvg);
      });
    }

    return averagedReports;
  }

  processReport(rawReport) {
    const processedReport = {};
    for (const metric of this.metricList) {
      processedReport[metric.name] = getReportProperty(rawReport, metric.path);
    }
    return processedReport;
  }

  handleWorkerSuccess(data) {
    if (!data.report) throw new Error(`Failed to get report for ${data.url}`);
    this.reportList[data.url].push(this.processReport(data.report));
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
        resolve(this.handleWorkerSuccess(data));
      });
    });
  }

  async run() {
    for (const url of this.urlList) {
      for (let i = 0; i < this.iterations; i++) {
        this.queue.enqueue(() => this.spawnWorker(url, i));
      }
    }
    const averagedReports = await this.queue.processQueue();

    return { reports: this.reportList, averagedReports };
  }
}

export { Ballista };
