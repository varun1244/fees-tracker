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
  private readonly callback: TrackerCallBack | undefined
  private tracker: Tracker | null
  constructor(
    config: TrackerConfig,
    callback?: TrackerCallBack
  ) {
    this.infura = config.infura
    this.etherScan = config.etherScan
    if (this.infura === undefined && this.etherScan === undefined) {
      throw new Error('No listener config found')
    }
    this.callback = callback
  }

  initListener = async (): Promise<void> => {
    if (this.tracker !== null) return
    if (this.infura !== undefined) {
      this.tracker = await this.listenWithInfura()
    } else if (this.etherScan !== undefined) {
      this.tracker = await this.listenWithEtherScan()
    }

    process.on('SIGTERM', () => {
      this.disconnect()
    })
  }

  disconnect = () => {
    if (this.tracker !== null) {
      void this.tracker.disconnect()
      this.tracker = null
    }
  }

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
