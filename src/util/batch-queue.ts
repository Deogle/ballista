import { BallistaQueue } from "../ballista.js";

class BatchQueue implements BallistaQueue {
  queue: Array<()=>Promise<any>>;
  onExit: () => void;
  onBatchProcessed: (batch: any) => void;
  batchSize: number;

  constructor({ batchSize, onExit, onBatchProcessed }) {
    this.queue = [];
    this.onExit = onExit;
    this.onBatchProcessed = onBatchProcessed;
    this.batchSize = batchSize;
  }
  enqueue(item) {
    this.queue.push(item);
  }
  async processQueue() {
    if (!this.queue.length) return this.onExit();

    const batch = this.queue.splice(0, this.batchSize);
    await Promise.all(batch.map((queueItemFunction) => queueItemFunction()));
    if (this.onBatchProcessed) this.onBatchProcessed(batch);

    return this.processQueue();
  }
}

export { BatchQueue };
