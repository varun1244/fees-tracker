import axios from 'axios'
import { Agent } from 'http'
import logger from '../../logger'

export interface BinanceResp {
  symbol: string
  price: string
}

export default class FeeCalculator {
  private readonly agent: Agent
  private readonly host: string
  private readonly timeValue = new Map<number, number>()
  private readonly pollInterval: number
  private readonly maxSize
  private poll: NodeJS.Timeout | null = null
  private waiting: boolean
  static BINANCE_HOST = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'
  constructor (maxSize?: number) {
    this.host = FeeCalculator.BINANCE_HOST
    this.pollInterval = 950
    this.maxSize = maxSize ?? 60 // Defaults to cache 60 seconds data
    this.agent = new Agent({
      keepAlive: true
    })
  }

  start = (): void => {
    if (this.poll !== null) return
    void this.pollMethod()
    this.poll = setInterval(this.pollMethod, this.pollInterval)
  }

  stop = (): void => {
    if (this.poll !== null) {
      clearInterval(this.poll)
    }
    this.poll = null
  }

  getFeesUsd = (timestamp: number, fessEth: number, price?: number): string => {
    const rate = price ?? this.getRate(timestamp)
    if (rate === undefined) {
      throw new Error('No rate found for: ' + timestamp)
    }
    return parseFloat((rate * fessEth) + '').toFixed(4)
  }

  getRate = (timestamp: number): number | undefined => {
    return this.timeValue.get(timestamp)
  }

  private readonly pollMethod = async (): Promise<void> => {
    if (this.waiting) return
    const data = await this.getData()
    if (data !== null) {
      this.cacheData(data)
    }
  }

  private cacheData (data: BinanceResp, timestamp?: number): void {
    const current = timestamp ?? Math.ceil(new Date().getTime() / 1000)
    this.timeValue.set(current, parseFloat(data.price))
    // Ensure cache data doesn't grow out of bounds
    const timesArray = Array.from(this.timeValue.keys()).sort((a: number, b: number) => (b - a))
    if (timesArray.length === 1) {
      logger.info('Starting live price: ' + current)
    }
    timesArray.slice(this.maxSize).forEach(key => this.timeValue.delete(key))
  }

  private readonly getData = async (): Promise<BinanceResp | null> => {
    try {
      this.waiting = true
      const response = await axios.get(this.host, { httpAgent: this.agent })
      this.waiting = false
      return response.data
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}
