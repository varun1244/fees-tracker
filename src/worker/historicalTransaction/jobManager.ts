import { HistoricalTransactionManagerConfig } from "."
import TokenPair from "../../db/models/tokenPair"
import TransactionHistory from "../../db/models/transactionHistory"
import JobQueue from "../jobQueue"
import EtherscanTracker, { type EtherscanConfig } from "../tracker/etherscan"
import { TransactionBlock } from "../transformer/bulkTransactionHandler"

/**
 * Class that handles the fetching of historical transactions and finding the missing ones from the DB.
 */
export default class JobManager {
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

  getLowestBlock = async () => {
    let resp = await this.tokenPair.getTransactions({
      order: [["blockNumber", "ASC"]],
      limit: 1
    })
    if (resp.length > 0) {
      return resp[0]
    } else {
      return null
    }
  }

  isStartBlock = (lowestBlock: TransactionHistory) => {
    const startBlock = this.tokenPair.startBlock
    return (lowestBlock !== null && startBlock === lowestBlock?.get('blockNumber'))
  }

  isStartBlockCompleted = async () => {
    const startBlock = this.tokenPair.startBlock
    const txns = await this.tokenPair.getTransactions({
      where: {
        blockNumber: startBlock
      }
    })
    return txns.length > 0
  }
}
