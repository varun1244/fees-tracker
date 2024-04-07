import TokenPair from "@db/models/tokenPair"
import axios from 'axios'
import { Agent } from 'http'
import logger from "../../../logger"
import { TransactionBlock } from "../../transformer/bulkTransactionHandler"
import Tracker from "./interface"
import { TrackerCallBack } from "../"

export type EtherscanConfig = {
  tokenPair: TokenPair
  apiKey: string
  host?: string
  pollTimeout?: number
}

export type EtherscanRequest = {
  startBlock: number
  page?: number
  limit?: number
}

export type EtherscanResponse = {
  status: string,
  result: Array<TransactionBlock>
  message?: string
  error?: string
}

export default class EtherscanTracker extends Tracker {
  private waiting: boolean
  private host: string
  private address: string
  private apiKey: string
  private lastBlock: number | null
  private agent: Agent
  private pollTimeout: number
  private poller: NodeJS.Timeout
  callback: TrackerCallBack | undefined
  constructor(
    config: EtherscanConfig,
    callback?: TrackerCallBack
  ) {
    super()
    this.host = config.host ?? 'https://api.etherscan.io/api'
    this.pollTimeout = config.pollTimeout ?? 5000
    this.address = config.tokenPair.getContractAddress()
    this.apiKey = config.apiKey!
    this.lastBlock = null
    this.callback = callback
    this.agent = new Agent({
      'keepAlive': true
    })
  }

  getUrl = (req?: EtherscanRequest): string => {
    const url = new URL(this.host)
    url.searchParams.set('module', 'account')
    url.searchParams.set('action', 'tokentx')
    url.searchParams.set('sort', 'desc')
    url.searchParams.set('address', this.address)
    url.searchParams.set('apikey', this.apiKey)
    if (req != null && req.startBlock != null) {
      url.searchParams.set('startblock', req.startBlock!.toString())
      url.searchParams.set('page', req.page!.toString())
      url.searchParams.set('page', req.limit!.toString())
    } else if (this.lastBlock !== null) {
      url.searchParams.set('startblock', this.lastBlock!.toString())
    } else {
      url.searchParams.set('page', '1')
      url.searchParams.set('offset', '2')
    }
    return url.href
  }

  getData = async (req?: EtherscanRequest) => {
    const url = this.getUrl(req)
    try {
      this.waiting = true
      const response = await axios.get(url, { httpAgent: this.agent })
      this.waiting = false

      if (response.status === 200) {
        let data = response.data as EtherscanResponse
        logger.info({ status: data.status, message: data.message, result: data?.result.length })
        if (data.status !== '1') {
          if (data.message === 'No transactions found') {
            return data
          }
          throw new Error(data.error ?? data.message)
        }
        return data
      }
    } catch (error) {
      const msg = { "code": "FETCH:ERROR", url, error }
      logger.error(msg)
    }
  }

  private pollFetchData = async () => {
    // Skip if a request is already in progress
    if (this.waiting) return
    logger.info("Current block: " + (this.lastBlock ?? "NULL"))
    const data = await this.getData()
    if (data?.result && data?.result.length > 0) {
      const respData = data.result.filter((_val, index) => index % 2)
      this.callback?.apply(null, [respData])
      this.lastBlock = parseInt(data?.result[0].blockNumber!) + 1
    }
  }

  connect = async () => {
    logger.info("Poll frequency: ", this.pollTimeout)
    this.poller = setInterval(this.pollFetchData, this.pollTimeout)
    return this
  }

  disconnect = async () => {
    clearInterval(this.poller)
  }
}
