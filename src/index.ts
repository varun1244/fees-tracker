import EtherScanConfig from './config/etherscan.config'
import dbService from './db'
import TokenPair from './db/models/tokenPair'
import logger from './logger'
import redisOption from './redis'
import server from './server'
import Worker, { WorkerConfig } from './worker'
import JobQueue from './worker/jobQueue'
import LiveTracker from './worker/listener'
import HistoricalTransactionManager from './worker/listener/historicalTransaction'
import CryptoComparePrice from './worker/price/historical/cryptoCompare'
import LivePrice from './worker/price/livePrice'
import { type TransactionBlock } from './worker/transformer/bulkTransactionHandler'

const validateConnections = async (): Promise<void> => {
  await dbService.testConnection()
}

// Highest priority to provide real-time processing
const liveQueue = new JobQueue<TransactionBlock>({
  queueName: 'liveTracker',
  connection: redisOption,
  default: {
    priority: 1
  }
})

// Lower priority
const oldTxnQueue = new JobQueue<TransactionBlock>({
  queueName: 'historicalTracker',
  connection: redisOption,
  default: {
    priority: 10
  }
})

const workerTypes = new Map<string, object>()
workerTypes.set('live', {
  jobQueue: liveQueue,
  priceManager: new LivePrice(100)
})

workerTypes.set('old', {
  jobQueue: oldTxnQueue,
  priceManager: new CryptoComparePrice()
})

const initWorkers = (tokenPair: TokenPair | null) => {
  if (tokenPair === null) {
    return
  }
  const allowedWorkers = process.env.WORKERS ?? 'live,old'
  allowedWorkers.split(',').forEach((x: string) => {
    if (workerTypes.has(x)) {
      new Worker({
        tokenPair,
        ...workerTypes.get(x)
      } as WorkerConfig)
    }
  })
}

const init = async (): Promise<void> => {
  await validateConnections()
  const tokenPair = await TokenPair.findByPk(1)

  // Setup individual worker nodes
  if (process.env.MODE === 'worker') {
    initWorkers(tokenPair)
  } else {
    // start the server and also the trackers on the same instance
    // It can be split into its own seperate instance
    server()
    if (tokenPair !== null) {
      void new LiveTracker({
        etherscan: EtherScanConfig(tokenPair),
      }, (data: TransactionBlock[]) => {
        void liveQueue.addJob('newJobs', data)
      }).initListener()

      void new HistoricalTransactionManager({
        tokenPair: tokenPair,
        jobQueue: oldTxnQueue,
        etherscan: EtherScanConfig(tokenPair)
      }).start()
    }
  }
}

init().catch(err => {
  logger.error('Cannot initiate the server, please ensure the configurations are valid')
  console.error(err)
  process.exit(1)
})
