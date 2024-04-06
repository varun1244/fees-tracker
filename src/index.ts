import Server from './server'
import dbService from './db'
import Logger from './logger'

const validateConnections = async () => {
  try {
    await dbService.testConnection()
  } catch (err) {
    Logger.error('Cannot conenct to the DB, please make sure your configuration is correct')
    process.exit(1)
  }
}

const init = async () => {
  await validateConnections()
  if (process.env.MODE !== 'worker') {
    new Server()
  }
}

init()
