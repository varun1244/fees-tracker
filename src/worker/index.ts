import { type Job } from 'bullmq'
import type TokenPair from '../db/models/tokenPair'
import type JobQueue from './jobQueue'
import BulkTransactionHandler, { type TransactionBlock } from './transformer/bulkTransactionHandler'

import FeeCalculator from './transformer/feeCalculator'

export interface WorkerConfig {
  tokenPair: TokenPair
  jobQueue: JobQueue<TransactionBlock>
}

export default class Worker {
  jobQueue: JobQueue<TransactionBlock>
  feeCalculator: FeeCalculator
  tokenPair: TokenPair
  constructor (config: WorkerConfig) {
    this.jobQueue = config.jobQueue
    this.tokenPair = config.tokenPair
    this.feeCalculator = new FeeCalculator()
    this.init()
  }

  init = (): void => {
    this.feeCalculator.start()
    const worker = this.jobQueue.registerWorker('txnBlockHandler', (job: Job<TransactionBlock[]>) => {
      void new BulkTransactionHandler(this.tokenPair, this.feeCalculator).process(job.data)
    })

    process.on('SIGTERM', () => {
      this.feeCalculator.stop()
      void worker.close()
    })
  }
}
