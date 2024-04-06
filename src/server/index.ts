import express, { type Request, type Response } from 'express'
import TransactionHistory from '../db/models/transactionHistory'
import swaggerSpec from './swagger'

const swaggerUI = require('swagger-ui-express')

export default class Server {
  constructor() {
    const app = express()
    const port = 3000
    app.use('/q/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

    app.get('/', async (req: Request, res: Response) => {
      res.json({
        name: TransactionHistory.getTableName(),
        entries: await TransactionHistory.findOne()
      })
    })

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  }
}
