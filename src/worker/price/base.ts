import axios from 'axios'
import { Agent } from 'http'
import logger from '../../logger'

export interface CandleStickType {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface PriceConfig {
  host: string
}

export default abstract class BasePrice<T> {
  protected waiting: boolean
  host: string
  agent: any

  constructor (config: PriceConfig) {
    this.agent = new Agent({
      keepAlive: true
    })
    this.host = config.host
  }

  abstract getRate (timestamp: number): Promise<number | null>
  abstract start (): void
  abstract stop (): void

  getFeesUsd = async (timestamp: number, fessEth: number, price?: number): Promise<string> => {
    const rate = price ?? await this.getRate(timestamp)
    if (rate === null) {
      throw new Error('No rate found for: ' + timestamp)
    }
    return parseFloat((rate * fessEth) + '').toFixed(4)
  }

  protected getData = async (url: string = this.host): Promise<T | null> => {
    try {
      this.waiting = true
      const response = await axios.get(url, {
        httpAgent: this.agent,
        headers: { 'Content-Type': 'application/json' }
      })
      this.waiting = false
      return response.data
    } catch (error) {
      logger.error(error)
      return null
    }
  }
}
