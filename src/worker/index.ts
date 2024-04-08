import { type Job } from 'bullmq'
import type TokenPair from '../db/models/tokenPair'
import type JobQueue from './jobQueue'
import BulkTransactionHandler, { type TransactionBlock } from './transformer/bulkTransactionHandler'

import TransactionHistory from '../db/models/transactionHistory'
import livePrice from './price/livePrice'

export interface WorkerConfig {
  tokenPair: TokenPair
  jobQueue: JobQueue<TransactionBlock>
}

export default class Worker {
  jobQueue: JobQueue<TransactionBlock>
  livePrice: livePrice
  tokenPair: TokenPair
  constructor(config: WorkerConfig) {
    this.jobQueue = config.jobQueue
    this.tokenPair = config.tokenPair
    this.livePrice = new livePrice()
    this.init()
  }

  init = (): void => {
    this.livePrice.start()
    const worker = this.jobQueue.registerWorker('txnBlockHandler', async (job: Job<TransactionBlock[]>) => {
      const models = await (new BulkTransactionHandler(this.tokenPair, this.livePrice)).process(job.data)
      return await TransactionHistory.bulkCreate(models)
    })

    process.on('SIGTERM', () => {
      this.livePrice.stop()
      void worker.close()
    })
  }
}
