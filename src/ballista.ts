import path, { dirname } from "path";
import { Result } from "lighthouse";
import { BatchQueue } from "./util/batch-queue.js";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { averageValue, getReportProperty } from "./util/utils.js";
import chromeLauncher from "chrome-launcher";
import { Metric, Metrics } from "./types/metrics.js";
import { v4 as uuidv4 } from "uuid";

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORKER_PATH = path.join(__dirname, "worker", "lighthouse-worker.js");

export interface BallistaQueue {
  enqueue: (queueFunc: () => Promise<void>) => void;
  processQueue: () => Promise<void>;
}

export interface BallistaOutputWriter {
  write: (url: string, report: BallistaReport) => void;
  writeRawReport?: (url: string, report: Result) => void;
}

type BallistaReport = object[];

type BallistaOptions = {
  batchSize?: number;
  urlList: string[];
  metricList?: Metric[];
  iterations?: number;
  outputWriter?: BallistaOutputWriter;
  isDesktopMode?: boolean;
  onBatchProcessed?: (batch: any) => void;
};

class Ballista {
  urlList: string[];
  reportList: { [url: string]: BallistaReport };
  batchSize: number;
  iterations: number;
  metricList: Metric[];
  outputWriter: BallistaOutputWriter;
  onBatchProcessed: (batch: any) => void;
  queue: BallistaQueue;
  isDesktopMode: boolean;

  constructor({
    batchSize,
    urlList,
    metricList,
    iterations,
    outputWriter,
    isDesktopMode,
    onBatchProcessed,
  }: BallistaOptions) {
    this.urlList = urlList;
    this.reportList = urlList.reduce((prev, curr) => {
      prev[curr] = [];
      return prev;
    }, {});

    this.batchSize = batchSize || 1;
    this.iterations = iterations || 5;
    this.metricList = metricList || Object.values(Metrics);
    this.outputWriter = outputWriter;
    this.onBatchProcessed = onBatchProcessed;
    this.isDesktopMode = isDesktopMode;

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

    if (this.outputWriter) {
      Object.entries(this.reportList).forEach(([url, report]) => {
        this.outputWriter.write(url, report);
      });
    }

    for (const metric of this.metricList) {
      Object.entries(this.reportList).forEach(([url, report]) => {
        const reportAvg = averageValue(report, metric.name);
        averagedReports[url][metric.displayName] = metric.toString(reportAvg);
      });
    }

    return averagedReports;
  }

  processReport(report: Result) {
    if (this.outputWriter) {
      const url = `${report.requestedUrl}-${uuidv4()}`;
      this.outputWriter.writeRawReport(url,report);
    }
    const processedReport = {};
    for (const metric of this.metricList) {
      processedReport[metric.name] = getReportProperty(report, metric.path);
      if (isNaN(processedReport[metric.name])) {
        throw new Error(
          `Failed to get metric ${metric.name} for ${report.requestedUrl}`
        );
      }
    }
    return processedReport;
  }

  handleWorkerSuccess({ report, url }: { report: Result; url: string }) {
    if (!report) throw new Error(`Failed to get report for ${url}`);
    if (report.runtimeError) this.handleReportError(report);
    this.reportList[url].push(this.processReport(report));
  }

  handleReportError(report: Result) {
    const { runtimeError, requestedUrl } = report;
    const { code, message } = runtimeError;
    throw new Error(
      `Lighthouse failed to run for ${requestedUrl} with error code ${code}: \n ${message}`
    );
  }

  spawnWorker(url: string, id: number) {
    const workerData = {
      url,
      id: id,
      metricList: this.metricList.map((metric) => metric.path),
      isDesktopMode: this.isDesktopMode,
    };

    return new Promise<void>((resolve) => {
      const worker = new Worker(WORKER_PATH, { workerData });
      worker.on("message", (data) => {
        this.handleWorkerSuccess(data);
        resolve();
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
