import { expect } from 'chai'
import sinon from 'sinon'
import TokenPair from '../../../src/db/models/tokenPair'
import LivePrice from '../../../src/worker/price/livePrice'
import BulkTransactionHandler from '../../../src/worker/transformer/bulkTransactionHandler'
import { getMockTransactions } from '../../helpers'

describe('BulkTransactionHandler', () => {
  let txnHandler: BulkTransactionHandler
  let data = getMockTransactions()
  const tokenPair = new TokenPair()

  before(() => {
    const tokenPair = new TokenPair()
    sinon.stub(tokenPair, 'get').callsFake((_name) => '1')
  })

  describe('when rate is available', () => {
    before(() => {
      const livePrice = new LivePrice()
      sinon.stub(livePrice, 'getRate').callsFake(async (_ts) => 100)
      txnHandler = new BulkTransactionHandler(tokenPair, livePrice)
    })

    it('parses the gas fee accurately', async function () {
      const ts = parseInt(data[0].timeStamp)
      const resp = await txnHandler.computePrice(ts, data[0])
      expect(resp).to.be.deep.eq({
        feesEth: '0.0066',
        feesUsdt: '0.6600',
        rate: '100'
      })
    })

    it('processes the transactions accurately', async function () {
      const resp = await txnHandler.process(data)
      expect(resp.length).to.be.deep.eq(data.length / 2)
      expect(resp[0].details.rate).to.be.deep.eq('100')
    })
  })

  describe('when rate is not available', () => {
    before(() => {
      const livePrice = new LivePrice()
      sinon.stub(livePrice, 'getRate').callsFake(async (_ts) => null)
      txnHandler = new BulkTransactionHandler(tokenPair, livePrice)
    })

    it('returns null ', async function () {
      const ts = parseInt(data[0].timeStamp)
      const resp = await txnHandler.computePrice(ts, data[0])
      expect(resp).to.be.null
    })

    it('filters the transactions', async function () {
      const resp = await txnHandler.process(data)
      expect(resp.length).to.be.deep.eq(0)
    })
  })
})
