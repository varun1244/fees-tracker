import server from './server'
import dbService from './db'
import Logger from './logger'

const validateConnections = async (): Promise<void> => {
  await dbService.testConnection()
}

const init = async (): Promise<void> => {
  await validateConnections()
  if (process.env.MODE !== 'worker') {
    server()
  }
}

init().catch(err => {
  Logger.error('Cannot conenct to the DB, please make sure your configuration is correct')
  Logger.error(err)
  process.exit(1)
})
