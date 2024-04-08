import type TokenPair from '../../db/models/tokenPair'
import { type TransactionModel } from '../../db/models/transactionHistory'
import logger from '../../logger'
import BasePrice from '../price/base'

export interface TransactionBlock {
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
  swapRate?: string
}

export interface Fees {
  feesEth: string
  feesUsdt: string
  rate: string
}

export default class BulkTransactionHandler {
  tokenPair: TokenPair
  rateCalculator: BasePrice<any>
  constructor(tokenPair: TokenPair, rateCalculator: BasePrice<any>) {
    this.tokenPair = tokenPair
    this.rateCalculator = rateCalculator
  }

  private mathOp = (val1: string, val2: string, denom = 18) => {
    let decimals = val1.length
    decimals = decimals + val2.length
    const op1 = parseFloat('.' + val1)
    const op2 = parseFloat('.' + val2)
    const offset = (10 ** (denom - decimals))
    return { op1, op2, offset }
  }

  computePrice = async (ts: number, txn: TransactionBlock): Promise<Fees | null> => {
    try {
      const rate = await this.rateCalculator.getRate(ts)
      if (rate === null) throw new Error('Unknown rate')
      const { op1, op2, offset } = this.mathOp(txn.gasUsed, txn.gasPrice)
      const feesEth = (op1 * op2) / offset
      return {
        feesEth: feesEth.toString(),
        feesUsdt: await this.rateCalculator.getFeesUsd(ts, feesEth),
        rate: rate?.toString()
      }
    } catch (err) {
      logger.warn('Unable to find USDT rate at ts ' + ts + ', skipping this transaction')
      return null
    }
  }

  parseTxn = async (txn: TransactionBlock): Promise<TransactionModel | null> => {
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
      tokenPairId: this.tokenPair.get('id'),
      blockNumber: BigInt(txn.blockNumber),
      details: {
        from: txn.from,
        value: txn.to,
        gas: txn.gas,
        gasPrice: txn.gasPrice,
        rate: pricing.rate,
        swapRate: txn.swapRate,
        gasUsed: txn.gasUsed,
        cumulativeGasUsed: txn.cumulativeGasUsed
      }
    }
  }

  /**
   * Method to calculate the SWAP rate of the transaction and filter out one of the entries
   * @param data 
   */
  mergeAndFilter = (data: TransactionBlock[]) => {
    let resp = []
    for (let i = 0; i < data.length; i = i + 2) {
      const { op1, op2, offset } = this.mathOp(data[i].value, data[i + 1].value, 24)
      resp.push({
        ...data[i],
        swapRate: (op1 / op2 / offset).toString()
      })
    }
    return resp
  }

  process = async (data: TransactionBlock[]): Promise<TransactionModel[]> => {

    const processed = await Promise.all(this.mergeAndFilter(data).map(this.parseTxn))
    return processed.filter(txn => txn !== null) as TransactionModel[]
  }
}
