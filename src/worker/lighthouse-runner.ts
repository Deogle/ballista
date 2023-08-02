import lighthouse, { Config, Flags, defaultConfig } from "lighthouse";
import chromeLauncher from "chrome-launcher";
import { Metric } from "../types/metrics.js";

export const getLighthouseReport = async (url:string) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options: Flags = {
    output: "json",
    port: chrome.port,
  };

  const config: Config = {
    ...defaultConfig,
  };
  
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
