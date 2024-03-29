#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import cliProgress from "cli-progress";
import { Ballista } from "./src/ballista.js";
import { config } from "./src/types/config.js";
import path, { dirname } from "path";

import fs from "fs";
import FileWriter from "./src/util/file-writer.js";

const CMD_OPTIONS = [
  { name: "url", alias: "u", multiple: true, type: String },
  { name: "iterations", alias: "i", type: Number },
  { name: "outputDir", alias: "o", type: String },
  { name: "comparison", alias: "c", type: Boolean },
  { name: "version", alias: "v", type: Boolean },
  { name: "desktop", alias: "d", type: Boolean },
  { name: "cwd", type: Boolean },
];
const TIMER_ID = "lighthouse-batch";

function calculateComparison(averagedReports: { [x: string]: any }) {
  const key = Object.keys(averagedReports)[0];
  const baselineObject = { [`${key} (baseline)`]: averagedReports[key] };

  const comparisonReport = {
    ...baselineObject,
    ...averagedReports,
  };
  delete comparisonReport[key];

  const baselineValues = comparisonReport[Object.keys(comparisonReport)[0]];

  for (const [url, report] of Object.entries(comparisonReport)) {
    if (url.includes("baseline")) continue;
    for (const metric of config) {
      const metricName = metric.displayName;

      const baselineValue = Number(
        baselineValues[metric.displayName].split(" ")[0]
      );
      if (isNaN(baselineValue)) {
        continue;
      }
      const currentValue = Number(report[metricName].split(" ")[0]);
      const difference = currentValue - baselineValue;
      const differenceString = `${comparisonReport[url][metricName]} (${
        difference > 0 ? "+" : ""
      }${difference.toFixed(2)})`;
      comparisonReport[url][metricName] = differenceString;
    }
  }

  return comparisonReport;
}

function printVersion() {
  const { version } = JSON.parse(
    fs.readFileSync(
      path.join(dirname(new URL(import.meta.url).pathname), "../package.json"),
      "utf-8"
    )
  );
  console.log(`v${version}`);
}

function printCwd() {
  const cwd = process.cwd();
  console.log(cwd);
}

async function main({ url, iterations, desktop, comparison, outputDir}) {
  if (!url) return printHelp();
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  let progress = 0;


  const ballistaInstance = new Ballista({
    urlList: url,
    iterations: iterations,
    metricList: config,
    isDesktopMode: desktop,
    outputWriter: outputDir && new FileWriter({directoryName:outputDir}),
    onBatchProcessed: (batch) => {
      progress += batch.length;
      progressBar.update(progress);
    },
  });

  console.time(TIMER_ID);
  console.log(
    `Running ${ballistaInstance.iterations} iteration(s) on ${url.length} URL(s)...`
  );
  progressBar.start(ballistaInstance.iterations * url.length, progress);

  try {
    const { averagedReports }: { averagedReports: any } =
      await ballistaInstance.run();
    progressBar.stop();
    console.timeEnd(TIMER_ID);

    console.table(
      comparison ? calculateComparison(averagedReports) : averagedReports
    );
  } catch (error) {
    progressBar.stop();
    console.timeEnd(TIMER_ID);
    console.error(error.message);
  }
}

async function printHelp() {
  console.log(`Usage: ballista [options] [command]`);
}

(async () => {
  const options = commandLineArgs(CMD_OPTIONS);

  if (options.version) return printVersion();
  if (options.help) return printHelp();
  if (options.cwd) return printCwd();

  main(options);
})();
