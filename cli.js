#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import cliProgress from "cli-progress";
import { Ballista } from "./src/ballista.js";
import { config } from "./src/types/config.js";

const CMD_OPTIONS = [
  { name: "url", alias: "u", multiple: true, type: String },
  { name: "iterations", alias: "i", type: Number },
  { name: "outputDir", alias: "o", type: String },
];
const TIMER_ID = "lighthouse-batch";

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

  const { reports, averagedReports } = await ballistaInstance.run();

  progressBar.stop();
  console.timeEnd(TIMER_ID);

  console.table(averagedReports);
})();
