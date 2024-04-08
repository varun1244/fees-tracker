import TokenPair from "../../db/models/tokenPair"
import logger from "../../logger"
import JobQueue from "../jobQueue"
import { TrackerCallBack } from "../listener"
import EtherscanTracker, { type EtherscanConfig } from "../tracker/etherscan"
import { TransactionBlock } from "../transformer/bulkTransactionHandler"

export type HistoricalTransactionManagerConfig = {
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
  constructor(config: HistoricalTransactionManagerConfig) {
    this.tokenPair = config.tokenPair
    this.etherscan = config.etherscan
    this.jobQueue = config.jobQueue
    this.tracker = null
  }

  callback: TrackerCallBack = async (block: TransactionBlock[]) => {

  }

  initListener = async (): Promise<void> => {
    if (this.tracker !== null) return

    this.tracker = new EtherscanTracker(this.etherscan, this.callback)
    process.on('SIGTERM', () => {
      this.disconnect()
    })
  }

  disconnect = (): void => {
    if (this.tracker !== null) {
      void this.tracker.disconnect()
      this.tracker = null
    }
  }
}
