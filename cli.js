#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import cliProgress from "cli-progress";
import { Ballista } from "./src/ballista.js";
import { config } from "./src/types/config.js";

const CMD_OPTIONS = [
  { name: "url", alias: "u", multiple: true, type: String },
  { name: "iterations", alias: "i", type: Number },
  { name: "outputDir", alias: "o", type: String },
  { name: "comparison", alias: "c", type: Boolean },
];
const TIMER_ID = "lighthouse-batch";

function calculateComparison(averagedReports) {
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

(async () => {
  const options = commandLineArgs(CMD_OPTIONS);
  if (!options.url) throw new Error("No URLs provided");

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
  let progress = 0;

  console.time(TIMER_ID);
  console.log(
    `Running ${options.iterations} iteration(s) on ${options.url.length} URLs...`
  );
  progressBar.start(options.iterations * options.url.length, progress);

  const ballistaInstance = new Ballista({
    urlList: options.url,
    iterations: options.iterations,
    metricList: config,
    onBatchProcessed: (batch) => {
      progress += batch.length;
      progressBar.update(progress);
    },
  });

  const { averagedReports } = await ballistaInstance.run();

  progressBar.stop();
  console.timeEnd(TIMER_ID);

  console.table(
    options.comparison ? calculateComparison(averagedReports) : averagedReports
  );
})();
