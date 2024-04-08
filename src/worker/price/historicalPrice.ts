import RateCalculator from "../interface/rateCalculator";

export default class HistoricalPrice extends RateCalculator {
  constructor() {
    super()
  }

  getRate(timestamp: number): Promise<number | null> {
    throw new Error("Method not implemented.");
  }
}
