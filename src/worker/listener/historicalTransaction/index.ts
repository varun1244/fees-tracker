import type TokenPair from '../../../db/models/tokenPair'
import type JobQueue from '../../jobQueue'
import EtherscanTracker, { type EtherscanConfig } from '../../tracker/etherscan'
import { type TransactionBlock } from '../../transformer/bulkTransactionHandler'
import HistoricalTransactionUtils from './utils'

export interface HistoricalTransactionManagerConfig {
  tokenPair: TokenPair
  etherscan: EtherscanConfig
  jobQueue: JobQueue<TransactionBlock>
}

/**
 * Class responsible to backfil data from past transactions
 */
export default class HistoricalTransactionManager {
  tracker: EtherscanTracker | null
  tokenPair: TokenPair
  etherscan: EtherscanConfig
  jobQueue: JobQueue<TransactionBlock>
  utils: HistoricalTransactionUtils
  counter: number
  constructor (config: HistoricalTransactionManagerConfig) {
    this.tokenPair = config.tokenPair
    this.etherscan = config.etherscan
    this.jobQueue = config.jobQueue
    this.tracker = new EtherscanTracker(this.etherscan)
    this.utils = new HistoricalTransactionUtils(this.tokenPair, this.tracker)
    this.counter = 0
  }

  scheduleJob = async (): Promise<void> => {
    const blocks = await this.utils.getNewBatch()
    void this.jobQueue.addJob('backfillJob', blocks)
  }

  start = async (): Promise<boolean> => {
    const completed = await this.utils.isStartBlockCompleted()
    if (completed) {
      this.stop()
      return !completed
    }
    void this.scheduleJob()
    return true
  }

  stop = (): void => {
    if (this.tracker !== null) {
      void this.tracker.disconnect()
      this.tracker = null
    }
  }
}
