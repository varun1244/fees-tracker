import winston from 'winston'
import config from '../config'

const Logger = (logLevel: string) => winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
})

export default Logger(config.LOG_LEVEL)
