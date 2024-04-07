import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getMockTransactions } from "../../../helpers";
import Etherscan, { EtherscanConfig } from '../../../../src/worker/listener/tracker/etherscan'
import sinon from "sinon";
import TokenPair from "../../../../src/db/models/tokenPair";
import { expect } from "chai";

describe('Etherscan', () => {
  let instance: Etherscan
  let stub: MockAdapter;
  const receivedData = getMockTransactions()
  const sandbox = sinon.createSandbox()
  const tokenPair = new TokenPair()
  const dummyToken = '0x123456689'

  before(function () {
    const tokenPair = new TokenPair()
    sinon.stub(tokenPair, 'getContractAddress').callsFake(() => dummyToken)
    const config: EtherscanConfig = {
      apiKey: '1234',
      pollTimeout: 1000,
      tokenPair: tokenPair
    }

    stub = new MockAdapter(axios)
      .onGet('https://api.etherscan.io/api?module=account&action=tokentx&sort=desc&address=0x123456689&apikey=1234&page=1&offset=2')
      .reply(200, { status: '1', result: receivedData })
      .onGet('https://api.etherscan.io/api?module=account&action=tokentx&sort=desc&address=0x123456689&apikey=1234&startblock=19605213')
      .reply(200, { status: '0', result: [], message: 'No transactions found' })
      .onGet('https://api.etherscan.io/api?module=account&action=tokentx&sort=desc&address=0x123456689&apikey=1234&startblock=1&page=1&offset=1')
      .reply(404, { error: "Not found" })
      .onGet('https://api.etherscan.io/api?module=account&action=tokentx&sort=desc&address=0x123456689&apikey=1234&startblock=2&page=1&offset=1')
      .reply(200, { status: '0', message: 'NOTOK' })

    instance = new Etherscan(config)
  });

  afterEach(() => {
    sandbox.restore()
  })

  it('generates first url without startBlock', () => {
    let urlSearch = new URLSearchParams(instance.getUrl())
    expect(urlSearch.get('address')).to.be.equal(dummyToken)
    expect(urlSearch.get('apikey')).to.be.equal('1234')
    expect(urlSearch.get('page')).to.be.equal('1')
    expect(urlSearch.get('offset')).to.be.equal('2')
    expect(urlSearch.get('startblock')).to.be.null
  })

  it('updates block address after first get', function (done) {
    this.timeout(3000)
    instance.connect()
    setTimeout(() => {
      let urlSearch = new URLSearchParams(instance.getUrl())
      expect(urlSearch.get('startblock')).to.not.be.null
      expect(urlSearch.get('page')).to.be.null
      expect(urlSearch.get('offset')).to.be.null
      instance.disconnect()
      done()
    }, 1000)
  })

  it('does not update when no new transaction found', (done) => {
    let urlSearch = new URLSearchParams(instance.getUrl())
    const startblock = urlSearch.get('startblock')
    expect(startblock).to.not.be.null
    instance.connect()
    setTimeout(() => {
      let urlSearch = new URLSearchParams(instance.getUrl())
      expect(urlSearch.get('startblock')).to.be.equal(startblock)
      instance.disconnect()
      done()
    }, 1000)
  })

  it('handles fetching of custom blocks', () => {
    let urlSearch = new URLSearchParams(instance.getUrl({
      startblock: 1,
      page: 100,
      limit: 100
    }))
    expect(urlSearch.get('startblock')).to.not.be.equal(1)
    expect(urlSearch.get('page')).to.not.be.equal(100)
    expect(urlSearch.get('offset')).to.not.be.equal(100)
  })

  it('handles API error', async () => {
    let resp = await instance.getData({
      startblock: 1,
      page: 1,
      limit: 1
    })
    expect(resp).to.be.null
  })

  it('handles request error', async () => {
    let resp = await instance.getData({
      startblock: 2,
      page: 1,
      limit: 1
    })
    expect(resp).to.be.null
  })
})
