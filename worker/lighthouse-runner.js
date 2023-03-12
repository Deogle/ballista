import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";

export const getLighthouseReport = async (url, auditValues) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options = {
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
    disableDeviceEmulation: true,
  };

  const config = {
    extends: "lighthouse:default",
    settings: {
      onlyAudits: auditValues,
    },
  };
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
