import BasePrice, { type CandleStickType } from '../base'

/**
 * Base class to add new historicalPrice providers
 * Currently using coinCompare.
 *
 * Similarly, we can create `binance.ts` which extends this class and implement the `getCandleStickData` method
 */
export default abstract class HistoricalPrice<T> extends BasePrice<T> {
  protected abstract getCandleStickData (timestamp: number): Promise<CandleStickType | null>

  average = (data: CandleStickType): number => {
    return (data.open + data.high + data.low + data.close) / 4
  }

  getRate = async (timestamp: number): Promise<number | null> => {
    const candleStick = await this.getCandleStickData(timestamp)
    return candleStick === null ? null : this.average(candleStick)
  }

  start = (): void => {
    // No op
  }

  stop = (): void => {
    // No op
  }
}
