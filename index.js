#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import fs from "fs";
import cliProgress from "cli-progress";
import { Worker } from "worker_threads";
import { config, AuditTypes } from "./config.js";

const optionDefinitions = [
  { name: "url", alias: "u", multiple: true, type: String },
  { name: "help", alias: "h", type: Boolean },
  { name: "iterations", alias: "i", type: Number },
  { name: "outputDir", alias: "o", type: String },
];

const BATCH_SIZE = 10;
const queue = [];

const processQueue = async (options, firstReportList, secondReportList) => {
  if (!queue.length)
    return handleExit(options, firstReportList, secondReportList);
  const batch = queue.splice(0, BATCH_SIZE);
  await Promise.all(batch.map((item) => item()));
  processQueue(options, firstReportList, secondReportList);
};

const main = async () => {
  const options = commandLineArgs(optionDefinitions);
  if (!options.url) throw new Error("No URLs provided");

  const firstReportList = [];
  const secondReportList = [];

  const onWorkerMessage = ({ url, report, id }) => {
    options.url[0] === url
      ? firstReportList.push(report)
      : secondReportList.push(report);

    progress++;
    progressBar.update(progress);

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
      const worker = new Worker("./lighthouse-worker.js", {
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

  console.log(
    `Running ${options.iterations} iterations on ${options.url.length} URLs...`
  );
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  let progress = 0;
  progressBar.start(options.iterations * options.url.length, progress);

  for (const url of options.url) {
    for (let i = 0; i < options.iterations; i++) {
      queue.push(() => spawnWorker(url, i));
    }
  }
  processQueue(options, firstReportList, secondReportList);
};

const handleExit = (options, firstReportList, secondReportList) => {
  if (!firstReportList.length || !secondReportList.length)
    throw new Error("No reports found");

  const table = {
    [options.url[0]]: {},
    [options.url[1]]: {},
  };

  for (const auditType of config) {
    const [firstReport, secondReport] = averageValues(
      firstReportList,
      secondReportList,
      `audits.${auditType.id}.numericValue`
    );
    table[options.url[0]][auditType.id] = auditType.toString(firstReport);
    table[options.url[1]][auditType.id] = auditType.toString(secondReport);
  }

  console.table(table);
};

const findJsonPath = (json, path) => {
  return path.split(".").reduce((acc, curr) => {
    if (!acc) throw new Error(`Failed to index into ${curr}`);
    return acc[curr];
  }, json);
};

const averageValues = (firstReport, secondReport, path) => {
  if (!findJsonPath(firstReport[0], path))
    throw new Error(`Failed to index into ${path}`);
  const firstReportList = firstReport.reduce((acc, curr) => {
    return acc + findJsonPath(curr, path);
  }, 0);
  const secondReportList = secondReport.reduce((acc, curr) => {
    return acc + findJsonPath(curr, path);
  }, 0);
  const firstReportAvg = firstReportList / firstReport.length;
  const secondReportAvg = secondReportList / secondReport.length;

  return [firstReportAvg, secondReportAvg];
};

main();
