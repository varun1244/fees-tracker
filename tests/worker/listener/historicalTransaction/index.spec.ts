import sinon from 'sinon'
import TokenPair from '../../../../src/db/models/tokenPair'
import HistoricalTransactionManager from '../../../../src/worker/listener/historicalTransaction'
import HistoricalTransactionUtils from '../../../../src/worker/listener/historicalTransaction/utils'
import EtherscanTracker from '../../../../src/worker/tracker/etherscan'
import JobQueue from '../../../../src/worker/jobQueue'
import Redis from 'ioredis-mock'
import { expect } from 'chai'

describe('HistoricalTxnListener', () => {
  let sandbox: sinon.SinonSandbox
  let tokenPair: TokenPair
  let utilInstance: sinon.SinonStubbedInstance<HistoricalTransactionUtils>
  let etherscanInstance: EtherscanTracker
  let jobQueueInstance: JobQueue<any>
  let instance: HistoricalTransactionManager
  let utilsStub: sinon.SinonStub<any[], any>
  let isStartBlockCompleted = true

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    tokenPair = new TokenPair()
    etherscanInstance = new EtherscanTracker({
      tokenPair: tokenPair,
      apiKey: '123456'
    })

    jobQueueInstance = new JobQueue({
      connection: new Redis(),
      queueName: 'test'
    })

    utilInstance = sandbox.stub(new HistoricalTransactionUtils(
      tokenPair,
      etherscanInstance
    ))

    instance = new HistoricalTransactionManager({
      tokenPair,
      etherscan: {
        'apiKey': 'ascdcdc',
        tokenPair,
      },
      jobQueue: jobQueueInstance
    })

    utilsStub = sinon.stub(instance.utils, 'isStartBlockCompleted').callsFake(async () => {
      return isStartBlockCompleted
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('no jobs are started if historical txns are completed', async () => {
    const spy = sandbox.spy(instance, 'stop')
    const resp = await instance.start()
    expect(await instance.utils.isStartBlockCompleted()).to.be.equal(true)
    expect(spy.called)
    expect(resp).to.be.eq(false)
  })


  it('new job started when historical txns are present', async () => {
    isStartBlockCompleted = false
    const spy = sandbox.stub(instance, 'scheduleJob').callsFake(async () => { })
    const resp = await instance.start()
    expect(await instance.utils.isStartBlockCompleted()).to.be.equal(false)
    expect(spy.called)
    expect(resp).to.be.eq(true)
  })
})
