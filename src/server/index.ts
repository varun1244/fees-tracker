import express, { type Request, type Response } from 'express'
import dbService from '../db'

export default class Server {
  constructor() {
    const app = express()
    const port = 3000
    app.get('/', (req: Request, res: Response) => {
      console.log(dbService)
      res.send('Hello World!')
    })

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  }
}
