import { Result } from "lighthouse";
import { BallistaOutputWriter } from "../ballista.js";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path"

type WriterOptions = {
  directoryName: string;
};

class FileWriter implements BallistaOutputWriter {
  directoryName: string;

  constructor({ directoryName }: WriterOptions) {
    if(!fsSync.existsSync(directoryName)) throw new Error(`Directory '${directoryName}' does not exist`)
    this.directoryName = directoryName;
  }

  #buildUrl(url:string){
    const sanitizedUrl = url.replace(/(^\w+:|^)\/\//, '').replaceAll('/','-');
    const filename = `${sanitizedUrl}.json`
    return path.join(this.directoryName,filename) 
  }

  write(url: string, report: object[]) {
    fs.writeFile(this.#buildUrl(url), JSON.stringify(report))
  }

  writeRawReport(url: string, report: Result) {
    fs.writeFile(this.#buildUrl(`${url}-raw`), JSON.stringify(report)) 
  }
}

export default FileWriter;
