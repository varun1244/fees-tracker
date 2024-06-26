import logger from '../../logger'
import type Tracker from '../tracker/interface'
import { type TransactionBlock } from '../transformer/bulkTransactionHandler'
import EtherscanTracker, { type EtherscanConfig } from '../tracker/etherscan'
import { type InfuraConfig } from '../tracker/infura'

export interface TrackerConfig {
  etherscan?: EtherscanConfig
  infura?: InfuraConfig
}

export type TrackerCallBack = (block: TransactionBlock[]) => void

export default class LiveTracker {
  private readonly etherscan
  private readonly infura
  private readonly callback: TrackerCallBack | undefined
  private tracker: Tracker | null
  constructor (
    config: TrackerConfig,
    callback?: TrackerCallBack
  ) {
    this.tracker = null
    this.infura = config.infura
    this.etherscan = config.etherscan
    if (this.infura === undefined && this.etherscan === undefined) {
      throw new Error('No configuration provided')
    }
    this.callback = callback
  }

  initListener = async (): Promise<void> => {
    if (this.tracker !== null) return
    if (this.infura !== undefined) {
      this.tracker = this.listenWithInfura()
    } else if (this.etherscan !== undefined) {
      this.tracker = this.listenWithEtherScan()
    }

    process.on('SIGTERM', () => {
      this.disconnect()
    })
  }

  disconnect = (): void => {
    if (this.tracker !== null) {
      void this.tracker.disconnect()
      this.tracker = null
    }
  }

  private readonly listenWithInfura = (): Tracker => {
    // this.tracker = new InfuraTracker(this.infura!)
    throw new Error('Module not implemented')
  }

  private readonly listenWithEtherScan = (): Tracker => {
    if (this.etherscan === undefined) {
      throw new Error('Invalid config')
    }
    logger.info('Using etherscan listener')
    const tracker = new EtherscanTracker(this.etherscan, this.callback)
    tracker.connect()
    return tracker
  }
}
