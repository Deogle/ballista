#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import fs from "fs";
import cliProgress from "cli-progress";
import { Worker } from "worker_threads";
import { config } from "./src/types/config.js";
import { averageValue } from "./utils.js";

const TIMER_ID = "lighthouse-batch";
const WORKER_PATH = "./src/worker/lighthouse-worker.js";
const BATCH_SIZE = 10;

const CMD_OPTIONS = [
  { name: "url", alias: "u", multiple: true, type: String },
  { name: "help", alias: "h", type: Boolean },
  { name: "iterations", alias: "i", type: Number },
  { name: "outputDir", alias: "o", type: String },
];

const queue = [];

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
let progress = 0;

const processQueue = async (options, reportList) => {
  if (!queue.length) return handleExit(reportList);
  const batch = queue.splice(0, BATCH_SIZE);
  await Promise.all(batch.map((workerFunc) => workerFunc()));
  progress += BATCH_SIZE;
  progressBar.update(progress);
  processQueue(options, reportList);
};

const main = async () => {
  const options = commandLineArgs(CMD_OPTIONS);
  if (!options.url) throw new Error("No URLs provided");

  const reportList = {};
  options.url.forEach((url) => (reportList[url] = []));

  const onWorkerMessage = ({ url, report, id }) => {
    if (!report) throw new Error(`Failed to get report for ${url}`);
    reportList[url].push(report);
    options.outputDir && writeReport(report, url, id);
  };

  const writeReport = (report, url, iteration) => {
    const reportPath = `${options.outputDir}/${url.replace(
      /https?:\/\//,
      ""
    )}-${iteration}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report));
  };

  const spawnWorker = async (url, id) => {
    return new Promise((resolve) => {
      const worker = new Worker(WORKER_PATH, {
        workerData: {
          url,
          id: id,
          metricList: config.map((metric) => metric.path),
        },
      });
      worker.on("message", (data) => {
        onWorkerMessage(data);
        resolve();
      });
    });
  };

  console.time(TIMER_ID);
  console.log(
    `Running ${options.iterations} iteration(s) on ${options.url.length} URLs...`
  );

  progressBar.start(options.iterations * options.url.length, progress);

  for (const url of options.url) {
    for (let i = 0; i < options.iterations; i++) {
      queue.push(() => spawnWorker(url, i));
    }
  }
  processQueue(options, reportList);
};

const handleExit = (reportList) => {
  progressBar.stop();
  if (Object.values(reportList).some((report) => !report))
    throw new Error("No reports found");

  const table = Object.keys(reportList).reduce((prevObj, url) => {
    prevObj[url] = {};
    return prevObj;
  }, {});

  const columns = config.map((auditType) => auditType.displayName);

  for (const auditType of config) {
    Object.entries(reportList).forEach(([url, report]) => {
      const reportAvg = averageValue(report, auditType.path);
      table[url][auditType.displayName] = auditType.toString(reportAvg);
      columns[auditType.displayName] = reportAvg;
    });
  }

  console.table(table);
  console.timeEnd(TIMER_ID);
};

main();
