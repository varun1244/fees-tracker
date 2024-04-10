import HistoricalPrice from "."
import { CandleStickType } from "../base"

export type CryptoCompareResponse = {
  "Response": string
  "Message": string
  "HasWarning": boolean
  "Type": number
  "Data": {
    "Aggregated": boolean
    "TimeFrom": number
    "TimeTo": number
    "Data": CandleStickType[]
  }
}

const HOST = "https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USDT"
const TS_PARAM = "toTs"

export {
  HOST,
  TS_PARAM
}

export default class CryptoComparePrice extends HistoricalPrice<CryptoCompareResponse> {
  timeValue: Map<number, CandleStickType>
  asyncReq: any
  constructor(limit?: number) {
    const url = new URL(HOST)
    url.searchParams.set('limit', (limit ?? 1440).toString())
    super({
      host: url.href
    })
    this.timeValue = new Map()
  }

  // Note: The ts expected is in minutes
  private generateData = (timestamp: number) => {
    if (this.asyncReq) return this.asyncReq
    const url = new URL(HOST)
    url.searchParams.set(TS_PARAM, timestamp.toString())
    this.asyncReq = this.getData(url.href).then(data => {
      if (data === null) {
        return
      }
      this.timeValue = new Map()
      data.Data.Data.forEach(x => {
        const key = this.normalizeTs(x.time)
        this.timeValue.set(key, x)
      })
      this.asyncReq = null
      return this.timeValue
    })
    return this.asyncReq
  }

  normalizeTs = (ts: number) => {
    return (ts - (ts % 60))
  }

  protected getCandleStickData = async (timestamp: number): Promise<CandleStickType | null> => {
    const parsedTs = this.normalizeTs(timestamp)
    if (!this.timeValue.has(parsedTs)) {
      await this.generateData(timestamp)
    }
    return this.timeValue.get(parsedTs) ?? null
  }
}
