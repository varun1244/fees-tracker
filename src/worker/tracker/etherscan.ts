import axios from 'axios'
import { Agent } from 'http'
import { type TrackerCallBack } from '../listener/liveTxn'
import type TokenPair from '../../db/models/tokenPair'
import logger from '../../logger'
import Tracker from './interface'
import { type TransactionBlock } from '../transformer/bulkTransactionHandler'

export interface EtherscanConfig {
  tokenPair: TokenPair
  apiKey: string
  host?: string
  pollTimeout?: number
}

export interface EtherscanRequest {
  page: number
  offset: number
  startblock?: string
  endblock?: string
}

export interface EtherscanResponse {
  status: string
  result: TransactionBlock[]
  message?: string
  error?: string
}

export default class EtherscanTracker extends Tracker {
  private waiting: boolean
  private readonly host: string
  private readonly address: string
  private readonly apiKey: string
  private lastBlock: number | null
  private readonly agent: Agent
  private readonly pollTimeout: number
  private poller: NodeJS.Timeout | null = null
  callback: TrackerCallBack | undefined
  constructor (
    config: EtherscanConfig,
    callback?: TrackerCallBack
  ) {
    super()
    this.host = config.host ?? 'https://api.etherscan.io/api'
    this.pollTimeout = config.pollTimeout ?? 5000
    this.address = config.tokenPair.getContractAddress()
    this.apiKey = config.apiKey
    this.lastBlock = null
    this.callback = callback
    this.agent = new Agent({
      keepAlive: true
    })
  }

  getUrl = (req?: EtherscanRequest): string => {
    const url = new URL(this.host)
    url.searchParams.set('module', 'account')
    url.searchParams.set('action', 'tokentx')
    url.searchParams.set('sort', 'desc')
    url.searchParams.set('address', this.address)
    url.searchParams.set('apikey', this.apiKey)
    url.searchParams.set('offset', '100')
    if (req !== undefined) {
      Object.keys(req).forEach((key: keyof EtherscanRequest) => {
        if (req[key] !== undefined && req[key] !== null) {
          url.searchParams.set(key, (req[key] ?? '').toString())
        }
      })
    } else if (this.lastBlock !== null) {
      url.searchParams.set('startblock', this.lastBlock.toString())
    } else {
      url.searchParams.set('page', '1')
      url.searchParams.set('offset', '2')
    }
    if (parseInt(url.searchParams.get('offset') ?? '0') % 2 !== 0) {
      throw new Error('Offset value should always be an even number')
    }
    return url.href
  }

  getData = async (req?: EtherscanRequest): Promise<EtherscanResponse | null> => {
    const url = this.getUrl(req)
    try {
      this.waiting = true
      const response = await axios.get(url, { httpAgent: this.agent })
      this.waiting = false

      if (response.status === 200) {
        const data = response.data as EtherscanResponse
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
      const msg = { code: 'FETCH:ERROR', url, error }
      logger.error(msg)
    }
    return null
  }

  pollFetchData = async (): Promise<void> => {
    // Skip if a request is already in progress
    if (this.waiting) return
    logger.info('Current block: ' + (this.lastBlock ?? 'NULL'))
    const data = await this.getData()
    if (data?.result?.length !== undefined && data?.result?.length > 0) {
      void this.callback?.apply(null, [data.result])
      this.lastBlock = parseInt(data?.result[0].blockNumber) + 1
    }
  }

  connect = (): void => {
    if (this.poller === null) {
      logger.info('Poll frequency: ', this.pollTimeout)
      this.poller = setInterval(this.pollFetchData, this.pollTimeout)
    }
  }

  disconnect = async (): Promise<void> => {
    if (this.poller !== null) {
      logger.info('Disconnecting: ')
      clearInterval(this.poller)
      this.poller = null
    }
  }
}
