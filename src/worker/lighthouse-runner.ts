import lighthouse, { Config, Flags } from "lighthouse";
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
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        requestLatencyMs: 562.5,
        downloadThroughputKbps: 1474.5600000000002,
        uploadThroughputKbps: 675,
        cpuSlowdownMultiplier: 4
      }
    },
  };
  
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
