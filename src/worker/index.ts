import { type Job, type Worker } from 'bullmq'
import type TokenPair from '../db/models/tokenPair'
import type JobQueue from './jobQueue'
import BulkTransactionHandler, { type TransactionBlock } from './transformer/bulkTransactionHandler'
import TransactionHistory from '../db/models/transactionHistory'
import type BasePrice from './price/base'

export interface WorkerConfig {
  tokenPair: TokenPair
  jobQueue: JobQueue<TransactionBlock>
  priceManager: BasePrice<any>
}

export default class FeeWorker {
  jobQueue: JobQueue<TransactionBlock>
  tokenPair: TokenPair
  priceManager: BasePrice<any>
  worker: Worker<TransactionBlock[], any, string>
  constructor (config: WorkerConfig) {
    this.jobQueue = config.jobQueue
    this.tokenPair = config.tokenPair
    this.priceManager = config.priceManager
    this.priceManager.start()
    this.worker = this.jobQueue.registerWorker('txnBlockHandler', this.handleJob)
    this.init()
  }

  handleJob = async (job: Job<TransactionBlock[]>): Promise<TransactionHistory[]> => {
    if (job.data.length > 0) {
      const handler = new BulkTransactionHandler(this.tokenPair, this.priceManager)
      const models = await handler.process(job.data)
      return await TransactionHistory.bulkCreate(models)
    }
    return []
  }

  init = (): void => {
    process.on('SIGTERM', async () => {
      await this.destroy()
    })
  }

  destroy = async (): Promise<void> => {
    this.priceManager.stop()
    await this.worker.close()
  }
}
