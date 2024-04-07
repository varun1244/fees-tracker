import MockAdapter from 'axios-mock-adapter'
import FeeCalculator from '../../../src/worker/transformer/feeCalculator'
import { expect } from 'chai';
import axios from 'axios';

describe('FeeCalculator', () => {
  let feeCalculator = new FeeCalculator()
  let stub: MockAdapter;
  let sad = false
  const receivedData = {
    'symbol': 'ETHUSDT',
    'price': '100'
  }

  before(function () {
    feeCalculator = new FeeCalculator(4)
    stub = new MockAdapter(axios)
      .onGet('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
      .reply(200, receivedData)
  });

  it('does not return historical data', function () {
    const ts = Math.floor(new Date().getTime() / 1000)
    feeCalculator.start()
    expect(feeCalculator.getRate(ts)).to.be.undefined
    expect(() => {
      feeCalculator.getFeesUsd(ts, 100)
    }).to
      .throw('No rate found for: ' + ts)
    feeCalculator.stop()
  })

  it('polls for data', function (done) {
    this.timeout(5000)
    feeCalculator.start()
    setTimeout(() => {
      const ts = Math.floor(new Date().getTime() / 1000)
      expect(feeCalculator.getRate(ts)).to.be.eq(100)
      feeCalculator.stop()
      done()
    }, 2000)
  })

  it('evicts old data', function (done) {
    this.timeout(7000)
    feeCalculator.start()
    const ts = Math.floor(new Date().getTime() / 1000) + 1
    // With max size = 4
    // At second 4, the data should be available, but not at second 5
    setTimeout(() => {
      expect(feeCalculator.getRate(ts)).to.be.eq(100)
      setTimeout(() => {
        expect(feeCalculator.getRate(ts)).to.be.undefined
        feeCalculator.stop()
        done()
      }, 2000)
    }, 3000)
  })

  it('converts eth price with 4 precision', function (done) {
    feeCalculator.start()
    const ts = Math.floor(new Date().getTime() / 1000) + 1
    setTimeout(() => {
      expect(feeCalculator.getFeesUsd(ts, 0.00045)).to.be.eq('0.0450')
      feeCalculator.stop()
      done()
    }, 1000)
  })
})
