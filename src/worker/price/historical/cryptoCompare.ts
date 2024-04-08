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

const HOST = "https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USDT&limit=2"
const TS_PARAM = "toTs"

export default class CryptoComparePrice extends HistoricalPrice<CryptoCompareResponse> {
  timeValue: Map<number, CandleStickType>
  constructor() {
    super({
      host: HOST
    })
    this.timeValue = new Map()
  }

  private generateData = async (timestamp: number) => {
    const url = new URL(HOST)
    url.searchParams.set(TS_PARAM, timestamp.toString())
    let data = await this.getData(url.href)
    if (data === null) {
      return
    }
    this.timeValue = new Map()
    data.Data.Data.forEach(x => {
      const key = Math.floor(x.time / 1000)
      this.timeValue.set(key, x)
    })
    return this.timeValue
  }

  protected async getCandleStickData(timestamp: number): Promise<CandleStickType | null> {
    const parsedTs = Math.floor(timestamp / 1000)
    if (!this.timeValue.has(parsedTs)) {
      await this.generateData(timestamp)
    }
    return this.timeValue.get(parsedTs) ?? null
  }
}
