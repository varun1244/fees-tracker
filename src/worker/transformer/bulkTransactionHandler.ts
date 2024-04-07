import TransactionHistory, { TransactionModel } from "../../db/models/transactionHistory"
import FeeCalculator from "./feeCalculator"
import logger from "../../logger"
import TokenPair from "@db/models/tokenPair"

export type TransactionBlock = {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  transactionIndex: string
  gas: string
  gasPrice: string
  gasUsed: string
  cumulativeGasUsed: string
  input: string
  confirmations: string
}

export type Fees = {
  feesEth: string
  feesUsdt: string
  rate: string
}

export default class BulkTransactionHandler {
  tokenPair: TokenPair
  feeCalculator: FeeCalculator
  constructor(tokenPair: TokenPair, feeCalculator: FeeCalculator) {
    this.tokenPair = tokenPair
    this.feeCalculator = feeCalculator
  }

  private computePrice = async (ts: number, txn: TransactionBlock): Promise<Fees | null> => {
    try {
      const rate = this.feeCalculator.getRate(ts)
      let decimals = txn.gasUsed.length
      decimals = decimals + txn.gasPrice.length
      const gasUsed = parseFloat("." + txn.gasUsed)
      const gasPrice = parseFloat("." + txn.gasPrice)
      const offset = (10 ** (18 - decimals))
      const feesEth = (gasUsed * gasPrice / offset)
      return {
        feesEth: feesEth.toString(),
        feesUsdt: this.feeCalculator.getFeesUsd(ts, feesEth),
        rate: rate.toString()
      }
    } catch (err) {
      logger.warn("Unable to find USDT rate at ts " + ts + ", skipping this transaction")
      return null
    }
  }

  private parseTxn = async (txn: TransactionBlock): Promise<TransactionModel | null> => {
    const ts = parseInt(txn.timeStamp)
    const pricing = await this.computePrice(ts, txn)
    if (pricing === null) {
      return null
    }
    return {
      txnId: txn.hash,
      timestamp: new Date(ts * 1000),
      feesEth: pricing.feesEth,
      feesUsdt: pricing.feesUsdt,
      tokenPairId: this.tokenPair.get('id') as string,
      details: {
        blockNumber: txn.blockNumber,
        from: txn.from,
        value: txn.to,
        gas: txn.gas,
        gasPrice: txn.gasPrice,
        rate: pricing.rate,
        gasUsed: txn.gasUsed,
        cumulativeGasUsed: txn.cumulativeGasUsed,
      }
    }
  }

  process = async (data: Array<TransactionBlock>) => {
    let processed = await Promise.all(data.map(this.parseTxn))
    processed = processed.filter(txn => txn !== null)
    TransactionHistory.bulkCreate(processed as Array<TransactionModel>)
  }
}
