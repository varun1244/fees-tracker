import { Agent } from 'http'
import logger from '../../logger'
import BasePrice from './base'

export interface BinanceResp {
  symbol: string
  price: string
}

export default class LivePrice extends BasePrice<BinanceResp> {
  private readonly timeValue = new Map<number, number>()
  private readonly pollInterval: number
  private readonly maxSize
  private poll: NodeJS.Timeout | null = null
  static BINANCE_HOST = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'
  constructor(maxSize?: number) {
    super({
      host: LivePrice.BINANCE_HOST
    })
    this.host = LivePrice.BINANCE_HOST
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

  getRate = async (timestamp: number): Promise<number | null> => {
    return this.timeValue.get(timestamp) ?? null
  }

  private readonly pollMethod = async (): Promise<void> => {
    if (this.waiting) return
    const data = await this.getData()
    if (data !== null) {
      this.cacheData(data)
    }
  }

  private cacheData(data: BinanceResp, timestamp?: number): void {
    const current = timestamp ?? Math.ceil(new Date().getTime() / 1000)
    this.timeValue.set(current, parseFloat(data.price))
    // Ensure cache data doesn't grow out of bounds
    const timesArray = Array.from(this.timeValue.keys()).sort((a: number, b: number) => (b - a))
    if (timesArray.length === 1) {
      logger.info('Starting live price: ' + current)
    }
    timesArray.slice(this.maxSize).forEach(key => this.timeValue.delete(key))
  }
}
