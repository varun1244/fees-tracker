import { expect } from 'chai'
import TokenPair from '../../../src/db/models/tokenPair'

describe('models/tokenPair', () => {

  it('query all tokenPair', async () => {
    let data: Array<TokenPair> = await TokenPair.findAll()
    expect(data).to.be.an('array')
    expect(data.length).to.equal(2)
  })

  it('has all the required attributes', async () => {
    let tokenPair: TokenPair | null = await TokenPair.findByPk(1)
    expect(tokenPair).to.not.be.null
    expect(tokenPair?.dataValues).to.include.all.keys([
      'id', 'name', 'contractAddress', 'createdAt', 'updatedAt', 'active'
    ])
  })

  it('update tokenPair name', async () => {
    let tokenPair = await TokenPair.findByPk(1)
    expect(tokenPair).to.not.be.null
    const previousUpdatedAt = tokenPair?.get('updatedAt')
    tokenPair?.set('name', 'New Name')
    await tokenPair?.save()
    let updatedTokenPair = await TokenPair.findByPk(1)
    expect(updatedTokenPair?.get('name')).to.equal('New Name')
    expect(updatedTokenPair?.get('updatedAt')).to.not.equal(previousUpdatedAt)
  })
})
