class BatchQueue {
  constructor({ onExit, onBatchProcessed }) {
    this.queue = [];
    this.onExit = onExit;
    this.onBatchProcessed = onBatchProcessed;
  }
  enqueue(item) {
    this.list.push(item);
  }
  async processQueue(batchSize) {
    if (!this.list.length) return this.onExit();

    const batch = this.list.splice(0, batchSize);
    await Promise.all(
      batch.forEach((queueItemFunction) => queueItemFunction())
    );
    if (this.onBatchProcessed) this.onBatchProcessed();

    this.processQueue(batchSize);
  }
}

export { BatchQueue };
