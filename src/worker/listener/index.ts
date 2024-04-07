import bulkTransactionHandler, { TransactionBlock } from "../transformer/bulkTransactionHandler";
import EtherscanTracker, { EtherscanConfig } from "./tracker/etherscan";
import { InfuraConfig } from "./tracker/infura";
import Tracker from "./tracker/interface";

export type TrackerConfig = {
  etherScan?: EtherscanConfig
  infura?: InfuraConfig
}

export type TrackerCallBack = (block: Array<TransactionBlock>) => void

export default class LiveTracker {
  private etherScan
  private infura
  private tracker: Tracker
  callback: TrackerCallBack | undefined
  constructor(
    config: TrackerConfig,
    callback?: TrackerCallBack
  ) {
    this.infura = config.infura
    this.etherScan = config.etherScan
    this.callback = callback
    this.initListener()
  }

  initListener = async () => {
    if (this.infura !== undefined) {
      this.tracker = await this.listenWithInfura()
    } else if (this.etherScan !== undefined) {
      this.tracker = await this.listenWithEtherScan()
    }

    process.on('SIGTERM', () => {
      this.tracker.disconnect()
    })
  }

  // callback = async (data: Array<TransactionBlock>) => {
  //   // bulkTransactionHandler.process(data)
  // }

  private listenWithInfura = async (): Promise<Tracker> => {
    // this.tracker = new InfuraTracker(this.infura!)
    throw new Error("Module not implemented")
  }

  private listenWithEtherScan = async (): Promise<Tracker> => {
    return new EtherscanTracker(this.etherScan!, this.callback).connect()
  }
}
