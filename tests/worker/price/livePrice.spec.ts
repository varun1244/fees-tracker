import MockAdapter from 'axios-mock-adapter'
import LivePrice from '../../../src/worker/price/livePrice'
import { expect } from 'chai';
import axios from 'axios';

describe('livePrice', () => {
  let livePrice: LivePrice
  let stub: MockAdapter;
  let sad = false
  const receivedData = {
    'symbol': 'ETHUSDT',
    'price': '100'
  }

  before(function () {
    livePrice = new LivePrice(4)
    stub = new MockAdapter(axios)
      .onGet('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
      .reply(200, receivedData)
  });

  it('does not return historical data', function () {
    const ts = Math.floor(new Date().getTime() / 1000)
    livePrice.start()
    expect(livePrice.getRate(ts)).to.be.null
    livePrice.stop()
  })

  it('polls for data', function (done) {
    this.timeout(5000)
    livePrice.start()
    setTimeout(() => {
      const ts = Math.floor(new Date().getTime() / 1000)
      expect(livePrice.getRate(ts)).to.be.eq(100)
      livePrice.stop()
      done()
    }, 2000)
  })

  it('evicts old data', function (done) {
    this.timeout(7000)
    livePrice.start()
    const ts = Math.floor(new Date().getTime() / 1000) + 1
    // With max size = 4
    // At second 4, the data should be available, but not at second 5
    setTimeout(() => {
      expect(livePrice.getRate(ts)).to.be.eq(100)
      setTimeout(() => {
        expect(livePrice.getRate(ts)).to.be.null
        livePrice.stop()
        done()
      }, 2000)
    }, 3000)
  })

  it('converts eth price with 4 precision', function (done) {
    livePrice.start()
    const ts = Math.floor(new Date().getTime() / 1000) + 1
    setTimeout(async () => {
      expect(await livePrice.getFeesUsd(ts, 0.00045)).to.be.eq('0.0450')
      livePrice.stop()
      done()
    }, 1000)
  })
})
