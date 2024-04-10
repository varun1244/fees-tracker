import sinon from "sinon"
import TokenPair from "../../../../src/db/models/tokenPair"
import HistoricalTransactionUtils from "../../../../src/worker/listener/historicalTransaction/utils"
import EtherscanTracker from "../../../../src/worker/tracker/etherscan"
import { getMockTxnByToken } from "../../../helpers"
import { expect } from "chai"

describe('HistoricalTransactionUtil', () => {
  let sandbox: sinon.SinonSandbox
  let tokenPair: TokenPair
  let instance: HistoricalTransactionUtils
  let etherscanInstance: EtherscanTracker
  let startBlock: number, endblock: number

  beforeEach(() => {
    startBlock = 10
    endblock = 15
    sandbox = sinon.createSandbox()
    tokenPair = new TokenPair()
    tokenPair.startBlock = BigInt(10)
    etherscanInstance = new EtherscanTracker({
      tokenPair: tokenPair,
      apiKey: '123456'
    })

    instance = new HistoricalTransactionUtils(
      tokenPair,
      etherscanInstance
    )

    sandbox.stub(instance.tokenPair, 'getTransaction').callsFake(async () => {
      return getMockTxnByToken(tokenPair, startBlock, endblock)
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('getLowestBlock returns null if no txns are available', async () => {
    startBlock = 0
    endblock = 0
    const res = await instance.getLowestBlock()
    expect(res).to.be.null
  })

  it('getLowestBlock returns startBlock of lowest transaction', async () => {
    const txn = await instance.getLowestBlock()
    expect(instance.isStartBlock(txn!)).to.be.eq(true)
  })

  it('validates conditions when lowest block is already processed', async () => {
    startBlock = parseInt(tokenPair.startBlock.toString())
    endblock = startBlock + 3
    const txn = await instance.getLowestBlock()
    expect(await instance.isStartBlockCompleted()).to.be.eq(true)
  })

  it('getBatchParams has endBlock if block available', async () => {
    // Since 15 is greater than the configured startBlock, it will attempt to fetch more blocks
    startBlock = 15
    endblock = startBlock + 3
    const params = await instance.getBatchParams()
    expect(params).to.be.deep.eq({
      'page': 1,
      'offset': instance.offset,
      endblock: (startBlock - 1).toString()
    })
  })
})
