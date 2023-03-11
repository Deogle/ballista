#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import fs from "fs";
import cliProgress from "cli-progress";
import { Worker } from "worker_threads";
import { config } from "./config.js";
import { averageValue } from "./utils.js";

const TIMER_ID = "lighthouse-batch";
const WORKER_PATH = "./lighthouse-worker.js";
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
  progress += batch.length;
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

    if (progress === options.iterations * options.url.length) {
      progressBar.stop();
    }

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
          auditTypes: config.map((auditType) => auditType.id),
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
  if (Object.values(reportList).some((report) => !report))
    throw new Error("No reports found");

  const table = {};
  Object.keys(reportList).forEach((url) => (table[url] = []));

  for (const url of Object.keys(reportList)) {
    table[url]["Performance Score"] = (performanceScore * 100).toFixed(0);
    for (const auditType of config) {
      const reportAvg = averageValue(
        reportList[url],
        auditType.absolutePath
          ? auditType.id
          : `audits.${auditType.id}.numericValue`
      );
      table[url][auditType.displayName] = auditType.toString(reportAvg);
    }
  }

  console.table(table);
  console.timeEnd(TIMER_ID);
};

main();
