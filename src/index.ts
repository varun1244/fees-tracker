import server from './server'
import dbService from './db'
import logger from './logger'
import TokenPair from './db/models/tokenPair'
import LiveTracker from './worker/listener'
import JobQueue from './worker/jobQueue'
import redisOption from './redis'
import { type TransactionBlock } from './worker/transformer/bulkTransactionHandler'
import Worker from './worker'

const validateConnections = async (): Promise<void> => {
  await dbService.testConnection()
}

const jobQueue = new JobQueue<TransactionBlock>({
  queueName: 'liveTracker',
  connection: redisOption
})

const init = async (): Promise<void> => {
  await validateConnections()
  const tokenPair = await TokenPair.findByPk(1)

  // Setup individual worker nodes
  if (process.env.MODE === 'worker') {
    if (tokenPair !== null) {
      new Worker({
        tokenPair,
        jobQueue
      })
    }
  } else {
    // start the server and also the live tracker on the same instance
    // It can be split into its own seperate instance
    server()
    if (tokenPair !== null) {
      void new LiveTracker({
        etherScan: {
          tokenPair,
          apiKey: process.env.ETHERSCAN_API_KEY ?? '',
          pollTimeout: 2000
        }
      }, (data: TransactionBlock[]) => {
        void jobQueue.addJob('newJobs', data)
      }).initListener()
    }
  }
}

init().catch(err => {
  logger.error('Cannot initiate the server, please ensure the configurations are valid')
  console.error(err)
  process.exit(1)
})
