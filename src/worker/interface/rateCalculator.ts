export default abstract class RateCalculator {
  abstract getRate(timestamp: number): number | null | Promise<number | null>

  getFeesUsd = async (timestamp: number, fessEth: number, price?: number): Promise<string> => {
    const rate = price ?? await this.getRate(timestamp)
    if (rate === null) {
      throw new Error('No rate found for: ' + timestamp)
    }
    return parseFloat((rate * fessEth) + '').toFixed(4)
  }
}
