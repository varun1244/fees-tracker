import axios, { type CancelToken } from 'axios'
import { Agent } from 'http'
import logger from '../../logger'

export type BinanceResp = {
  symbol: string
  price: string
}

export default class FeeCalculator {
  private agent: Agent
  private host: string
  private timeValue: Map<number, number> = new Map()
  private maxSize = 60
  private pollInterval: number
  private poll: NodeJS.Timeout | null = null
  private waiting: boolean
  constructor() {
    this.host = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'
    this.pollInterval = 1000
    this.agent = new Agent({
      'keepAlive': true
    })
  }

  start = () => {
    if (this.poll !== null) return
    this.pollMethod()
    this.poll = setInterval(this.pollMethod, this.pollInterval)
  }

  stop = () => {
    if (this.poll !== null) {
      clearInterval(this.poll)
    }
    this.poll = null
  }

  getFeesUsd = (timestamp: number, fessEth: number, price: number = this.getRate(timestamp)) => {
    return parseFloat((price * fessEth) + '').toFixed(4);
  }

  getRate = (timestamp: number): number | never => {
    if (this.timeValue.get(timestamp) === undefined) {
      throw new Error("No rate found for: " + timestamp)
    }
    return this.timeValue.get(timestamp) as number
  }

  private pollMethod = async () => {
    if (this.waiting) return
    const data = await this.getData()
    if (data != null) {
      this.cacheData(data! as BinanceResp)
    }
  }

  private cacheData(data: BinanceResp, timestamp?: number) {
    const current = timestamp ?? Math.ceil(new Date().getTime() / 1000)
    this.timeValue.set(current, parseFloat(data.price))
    // Ensure cache data doesn't grow out of bounds
    const timesArray = Array.from(this.timeValue.keys()).sort((a: number, b: number) => (b - a))
    if (timesArray.length === 1) {
      logger.info("Starting live price: " + current)
    }
    timesArray.slice(this.maxSize).forEach(key => this.timeValue.delete(key))
  }

  private getData = async () => {
    try {
      this.waiting = true
      const response = await axios.get(this.host, { httpAgent: this.agent })
      this.waiting = false
      return response.data
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
}
