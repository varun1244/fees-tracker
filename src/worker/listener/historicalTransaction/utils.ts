import TokenPair from "../../../db/models/tokenPair"
import TransactionHistory from "../../../db/models/transactionHistory"
import EtherscanTracker, { EtherscanRequest } from "../../tracker/etherscan"
import { TransactionBlock } from "../../transformer/bulkTransactionHandler"

/**
 * Class that handles the fetching of historical transactions and finding the missing ones from the DB.
 */
export default class HistoricalTransactionUtils {
  etherscan: EtherscanTracker
  tokenPair: TokenPair
  offset: number
  constructor(tokenPair: TokenPair, etherscan: EtherscanTracker, batchSize?: number) {
    this.tokenPair = tokenPair
    this.etherscan = etherscan
    this.offset = batchSize ?? 4
  }

  getBatchParams = async (): Promise<EtherscanRequest> => {
    const lowestAvailableTxn = await this.getLowestBlock()
    let lowestAvailableBlock: number
    let params: EtherscanRequest = {
      page: 1,
      offset: this.offset
    }
    if (lowestAvailableTxn !== null) {
      lowestAvailableBlock = parseInt((lowestAvailableTxn.get('blockNumber') as BigInt).toString())
      params.endblock = (lowestAvailableBlock - 1).toString()
    }
    return params
  }

  getNewBatch = async (): Promise<TransactionBlock[]> => {
    let params = await this.getBatchParams()
    let data = await this.etherscan.getData(params)
    if (data?.result?.length !== undefined && data?.result?.length > 0) {
      return data.result.reverse()
    }
    return []
  }

  getLowestBlock = async (): Promise<TransactionHistory | null> => {
    let resp = await this.tokenPair.getTransaction({
      order: [["blockNumber", "ASC"]],
      limit: 1
    })
    if (resp.length > 0) {
      return resp[0]
    } else {
      return null
    }
  }

  isStartBlock = (lowestBlock: TransactionHistory): boolean => {
    const startBlock = this.tokenPair.startBlock
    return (lowestBlock !== null && startBlock === lowestBlock?.get('blockNumber'))
  }

  isStartBlockCompleted = async (): Promise<boolean> => {
    const startBlock = this.tokenPair.startBlock
    const txns = await this.tokenPair.getTransaction({
      where: {
        blockNumber: startBlock
      }
    })
    return txns.length > 0
  }
}
