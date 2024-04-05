import express, { type Request, type Response } from 'express'
import dbService from '../db'
import TransactionHistory from '../db/models/TransactionHistory'

export default class Server {
  constructor() {
    const app = express()
    const port = 3000
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
