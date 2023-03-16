import lighthouse from "lighthouse";
import * as lighthouseConstants from "lighthouse/core/config/constants.js";
import chromeLauncher from "chrome-launcher";

export const getLighthouseReport = async (url, metricList) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options = {
    output: "json",
    port: chrome.port,
  };

  const config = {
    extends: "lighthouse:default",
    settings: {
      formFactor: "desktop",
      screenEmulation: lighthouseConstants.screenEmulationMetrics.desktop,
      throttling: lighthouseConstants.throttling.desktopDense4G,
    },
  };
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
