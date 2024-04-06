import { expect } from 'chai'
import TransactionHistory from '../../../src/db/models/transactionHistory'

describe('models/TransactionHistory', () => {

  it('query all TransactionHistory', async () => {
    let data: Array<TransactionHistory> = await TransactionHistory.findAll()
    expect(data).to.be.an('array')
    expect(data.length).to.equal(2)
  })

  it('has all the required attributes', async () => {
    let txn: TransactionHistory | null = await TransactionHistory.findOne()
    console.log(txn?.toJSON)
    expect(txn).to.not.be.null
    expect(txn?.dataValues).to.include.all.keys([
      'txnId', 'tokenPairId', 'feesEth', 'feesUsdt', 'timestamp', 'details', 'createdAt', 'updatedAt'
    ])
  })
})
