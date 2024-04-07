import { Job } from "bullmq";
import TokenPair from "../db/models/tokenPair";
import JobQueue from "./jobQueue";
import BulkTransactionHandler, { TransactionBlock } from "./transformer/bulkTransactionHandler";

import FeeCalculator from './transformer/feeCalculator';

export type WorkerConfig = {
  tokenPair: TokenPair
  jobQueue: JobQueue<TransactionBlock>
}

export default class Worker {
  jobQueue: JobQueue<TransactionBlock>
  feeCalculator: FeeCalculator;
  tokenPair: TokenPair;
  constructor(config: WorkerConfig) {
    this.jobQueue = config.jobQueue
    this.tokenPair = config.tokenPair
    this.feeCalculator = new FeeCalculator()
    this.init()
  }

  init = () => {
    this.feeCalculator.start()
    const worker = this.jobQueue.registerWorker("txnBlockHandler", async (job: Job<Array<TransactionBlock>>) => {
      new BulkTransactionHandler(this.tokenPair, this.feeCalculator).process(job.data)
    })

    process.on('SIGTERM', () => {
      this.feeCalculator.stop()
      worker.close()
    })
  }
}
