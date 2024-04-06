import express, { type Express } from 'express'
import swaggerUI, { type JsonObject } from 'swagger-ui-express'
import config from './config'
import tokenRoute from './routes/token'
import transactionRoute from './routes/transaction'
import swaggerSpec from './swagger'

export default function Server(): Express {
  const app = express()
  const port = config.port

  /**
   * @openapi
   * /transaction:
   */
  app.use(config.baseApiPath + '/transaction', transactionRoute)

  /**
   * @openapi
   * /token:
   */
  app.use(config.baseApiPath + '/token', tokenRoute)

  app.use('/q/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec as JsonObject))


  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })

  return app
}
