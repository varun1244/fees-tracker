import express, { type RequestHandler, type Request, type Response } from 'express'
import TransactionHistory from '../db/models/transactionHistory'
import swaggerSpec from './swagger'

import swaggerUI, { type JsonObject } from 'swagger-ui-express'

export default function Server(): void {
  const app = express()
  const port = 3000
  app.use('/q/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec as JsonObject))

  app.get('/', (async (req: Request, res: Response) => {
    res.json({
      name: TransactionHistory.getTableName(),
      entries: await TransactionHistory.findOne()
    })
  }) as RequestHandler)

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}
