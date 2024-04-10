import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
import CryptoComparePrice, { TS_PARAM } from '../../../../src/worker/price/historical/cryptoCompare';

describe('cryptoCompare', () => {
  let instance: CryptoComparePrice
  const limit = 2
  const toTs = Math.ceil(new Date().getTime() / 1000)// Current time in Seconds
  const fromTs = toTs - (60 * limit)
  let mock: MockAdapter;
  let apiCount = 0
  const baseCandleStick = {
    "high": 102,
    "low": 98,
    "open": 99,
    "close": 101
  }

  const baseData = {
    "Response": "Success",
    "Message": "",
    "HasWarning": false,
    "Type": 100,
    "RateLimit": {},
    "Data": {}
  }

  beforeEach(function () {
    instance = new CryptoComparePrice(limit)
    const urlRegex = new RegExp('https://min-api\\.cryptocompare\\.com/data/v2/histominute(.*)')
    apiCount = 0
    mock = new MockAdapter(axios)
      .onGet(urlRegex)
      .reply((req) => {
        apiCount += 1
        const resp = { ...baseData }
        const parsedLink = new URL(req.url!)
        if (parsedLink.searchParams.get(TS_PARAM) === undefined) {
          return [400, {}]
        }
        const toTs = parseInt(parsedLink.searchParams.get(TS_PARAM)!)
        const fromTs = toTs - (60 * limit)
        const timeSeries: any[] = []
        resp.Data = {
          "Aggregated": fromTs,
          "TimeFrom": fromTs,
          "TimeTo": toTs,
          "Data": timeSeries
        }
        for (let i = 0; i < limit; i++) {
          timeSeries.push({
            "time": toTs - (i * 60),
            ...baseCandleStick
          })
        }
        return [200, resp]
      })
  });

  it('fetches the rate for a given ts', async () => {
    const resp = await instance.getRate(toTs)
    expect(resp).to.be.equal(100)
  })

  it('fetches the rate for a new ts dynamically despite the cache', async () => {
    const resp = await instance.getRate(toTs - Math.floor(Math.random() * 86400))
    expect(resp).to.be.equal(100)
  })

  it('makes only req for multiple parallel requests', async () => {
    // Calling this to clear cache for current ts
    await instance.getRate(toTs - 86400)
    const resp = await Promise.all([
      instance.getRate(toTs),
      instance.getRate(toTs),
      instance.getRate(toTs)
    ])
    // API count is 2, the first to clear the cache and the second for the others
    expect(apiCount).to.be.equal(2)
    for (let i of resp) {
      expect(i).to.be.equal(100)
    }
  })
})
