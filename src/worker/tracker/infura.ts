import Web3 from 'web3'
import type TokenPair from '../../db/models/tokenPair'
import Tracker from '../interface/tracker'

export interface InfuraConfig {
  tokenPair: TokenPair
  apiKey: string
  host: string
}

export default class InfuraTracker extends Tracker {
  subscription: any
  contractAddress: string
  web3: Web3

  constructor(config: InfuraConfig) {
    super()
    this.contractAddress = config.tokenPair.getContractAddress()
    this.web3 = new Web3(new Web3.providers.WebsocketProvider(`${config.host}/${config.apiKey}`))
  }

  connect = async (): Promise<this> => {
    // TODO: Setup infuraTracker
    // this.subscription = (await this.web3.eth.subscribe('logs', {
    //   address: this.contractAddress
    // })).on('data', async (transaction) => {
    //   if (transaction != null) {
    //
    //   }
    // })
    return this
  }

  disconnect = async (): Promise<void> => {
    this.subscription.unsubscribe()
  }
}
