import lighthouse, { Config, Flags } from "lighthouse";
import * as lighthouseConstants from "lighthouse/core/config/constants.js";
import chromeLauncher from "chrome-launcher";
import { Metric } from "../types/metrics.js";

export const getLighthouseReport = async (url:string, metricList:Metric[]) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options: Flags = {
    output: "json",
    port: chrome.port,
  };

  const config: Config = {
    extends: "lighthouse:default",
    settings: {
      formFactor: "desktop",
      screenEmulation: lighthouseConstants.screenEmulationMetrics.desktop,
      throttling: lighthouseConstants.throttling.mobileSlow4G,
    },
  };
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
