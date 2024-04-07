import sinon from 'sinon'
import { getMockTransactions } from '../../helpers'
import BulkTransactionHandler from '../../../src/worker/transformer/bulkTransactionHandler'
import FeeCalculator from '../../../src/worker/transformer/feeCalculator'
import TokenPair from '../../../src/db/models/tokenPair'
import { expect } from 'chai'

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
      const feeCalculator = new FeeCalculator()
      sinon.stub(feeCalculator, 'getRate').callsFake((_ts) => 100)
      txnHandler = new BulkTransactionHandler(tokenPair, feeCalculator)
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
      expect(resp.length).to.be.deep.eq(data.length)
      expect(resp[0].details.rate).to.be.deep.eq('100')
    })
  })

  describe('when rate is not available', () => {
    before(() => {
      const feeCalculator = new FeeCalculator()
      sinon.stub(feeCalculator, 'getRate').callsFake((_ts) => undefined)
      txnHandler = new BulkTransactionHandler(tokenPair, feeCalculator)
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
