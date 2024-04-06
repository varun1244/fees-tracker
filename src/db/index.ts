import * as fs from 'fs'
import * as path from 'path'
import { Sequelize, type Options } from 'sequelize'
import DBConfig from './config'

const env = process.env.NODE_ENV ?? 'development'
const config = DBConfig(env)

class DBProvider {
  public sequelize: Sequelize

  constructor () {
    if (config?.database == null || config.username == null) {
      throw new Error('Invalid DB configuration')
    }
    this.sequelize = new Sequelize(config.database, config.username, config.password, config as Options)
    this.registerModels()
  }

  testConnection = async (): Promise<void> => {
    await this.sequelize.authenticate()
  }

  closeConnection = async (): Promise<void> => {
    // TODO: Close connection on process termination
  }

  private readonly registerModels = (): void => {
    const directoryPath = path.join(__dirname, '.')

    fs.readdir(directoryPath, (err, files) => {
      if (err != null) {
        files.forEach((file): void => {
          if (file.indexOf('.') !== 0 && file.slice(-3) === '.ts') {
            import(path.join(directoryPath, file))
          }
        })
      }
    })
  }
}

export default new DBProvider()
