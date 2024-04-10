import assert from 'assert';
import { expect } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import TokenPair from '../../../src/db/models/tokenPair';
import LiveTxn from '../../../src/worker/listener/liveTxn';

describe('LiveTxn', () => {
  let instance: LiveTxn
  let sandbox: SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('fails if no valid config is provided', () => {
    assert.throws(() => {
      instance = new LiveTxn({})
    }, Error, 'No configuration provided')
  })

  it('fails if infura provider is used', (done) => {
    const tokenPair = sandbox.createStubInstance(TokenPair)
    let instance = new LiveTxn({
      infura: {
        tokenPair,
        apiKey: '123456',
        host: 'test.infura.com'
      }
    })
    instance.initListener().catch(err => {
      expect(err).to.be.equal('Module not implemented')
    }).finally(done)
  })

  it('initiates etherscan tracker', async function () {
    this.timeout(5000)
    const tokenPair = new TokenPair()
    const tokenStub = sandbox.stub(tokenPair, 'getContractAddress').callsFake(() => "address1")

    instance = new LiveTxn({
      etherscan: {
        tokenPair: tokenPair!,
        apiKey: '12345',
      }
    })

    await instance.initListener()
    expect(tokenStub.called)
    instance.disconnect()
  })
})
