import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from "sequelize";

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config.js')[env];
const db = {};

class DBProvider {
  public sequelize: Sequelize
  private models: {}

  constructor() {
    this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    this.registerModels()
  }

  testConnection = async () => {
    await this.sequelize.authenticate()
  }

  closeConnection = async () => {
    // TODO: Close connection on process termination
  }

  getModels = () => {
    return this.models
  }

  private registerModels = () => {
    const directoryPath = path.join(__dirname, '.');

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.log(err)
        return;
      }

      files.forEach(async (file) => {
        if (file.indexOf('.') !== 0 && file.slice(-3) === '.ts') {
          import(path.join(directoryPath, file))
        }
      });
    });
  }
}

export default new DBProvider()
