import { type TransactionBlock } from '../transformer/bulkTransactionHandler'
import EtherscanTracker, { type EtherscanConfig } from './tracker/etherscan'
import { type InfuraConfig } from './tracker/infura'
import type Tracker from './tracker/interface'

export interface TrackerConfig {
  etherScan?: EtherscanConfig
  infura?: InfuraConfig
}

export type TrackerCallBack = (block: TransactionBlock[]) => void

export default class LiveTracker {
  private readonly etherScan
  private readonly infura
  private tracker: Tracker
  callback: TrackerCallBack | undefined
  constructor (
    config: TrackerConfig,
    callback?: TrackerCallBack
  ) {
    this.infura = config.infura
    this.etherScan = config.etherScan
    this.callback = callback
    void this.initListener()
  }

  initListener = async (): Promise<void> => {
    if (this.infura !== undefined) {
      this.tracker = await this.listenWithInfura()
    } else if (this.etherScan !== undefined) {
      this.tracker = await this.listenWithEtherScan()
    }

    process.on('SIGTERM', () => {
      void this.tracker.disconnect()
    })
  }

  // callback = async (data: Array<TransactionBlock>) => {
  //   // bulkTransactionHandler.process(data)
  // }

  private readonly listenWithInfura = async (): Promise<Tracker> => {
    // this.tracker = new InfuraTracker(this.infura!)
    throw new Error('Module not implemented')
  }

  private readonly listenWithEtherScan = async (): Promise<Tracker> => {
    if (this.etherScan === undefined) {
      throw new Error('Invalid config')
    }
    return await new EtherscanTracker(this.etherScan, this.callback).connect()
  }
}
