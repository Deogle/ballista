import lighthouse, { Config, Flags, defaultConfig, desktopConfig } from "lighthouse";
import chromeLauncher from "chrome-launcher";

export const getLighthouseReport = async (url:string,isDesktopMode = false) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options: Flags = {
    output: "json",
    port: chrome.port,
  };

  const config: Config = isDesktopMode ? {...desktopConfig} : {...defaultConfig};
  
  const runnerResult = await lighthouse(url, options, config);

  await chrome.kill();
  return runnerResult.lhr;
};
