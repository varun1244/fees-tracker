import { Router, type Request, type Response, type NextFunction } from 'express'
import TokenPair from '../../db/models/tokenPair'
import transactionRoute from './transaction'

const router = Router()

/**
 * @openapi
 * /:
 *   get:
 *     description: Get all registered tokens
 *     responses:
 *       200:
 *         description: Get the list of tokens registered
 */
router.get('/', async (req: Request, res: Response) => {
  const query = {
    limit: 10,
    offset: 0
  }

  Object.keys(query).forEach(key => {
    if (key in req.query) {
      const val = req.query[key] as string
      query[key as keyof typeof query] = parseInt(val) - 1
    }
  })
  const tokens = await TokenPair.findAll(query)
  res.json(tokens.map(item => item.toJSON()))
})

/**
 * @openapi
 * /:
 *   post:
 *     description: Create a new token pair
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contractAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Token created
 */
router.post('/', async (req: Request, res: Response) => {
  const { name, contractAddress } = req.body
  const newToken = await TokenPair.create({ name, contractAddress })
  res.status(201).json(newToken.toJSON())
})

/**
 * @openapi
 * /{id}:
 *   get:
 *     description: Get information about a specific token
 *     responses:
 *       200:
 *         description: Token information
 *       404:
 *         Entity not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const token = await TokenPair.findByPk(req.params.id)
  if (token == null) {
    res.status(404).json({ error: 'Not found' })
  }
  res.json(token?.toJSON())
})

/**
 * @openapi
 * /{id}/transaction:
 *   get:
 *     description: Get information about a specific token
 *     responses:
 *       200:
 *         description: Token information
 *       404:
 *         Entity not found
 */
router.use('/:tokenId/transaction', (req: Request, res: Response, next: NextFunction) => {
  res.locals.tokenId = req.params.tokenId
  next()
}, transactionRoute)

/**
 * @openapi
 * /{id}:
 *   put:
 *     description: Update a token pair
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contractAddress:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Token updated
 *       404:
 *         Entity not found
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, contractAddress, active } = req.body
  const token = await TokenPair.findByPk(id)
  if (token === null) {
    return res.status(404).json({ error: 'Not found' })
  }
  token.set('name', name)
  token.set('contractAddress', contractAddress)
  token.set('active', active)
  await token.save()
  res.json(token.toJSON())
})

/**
 * @openapi
 * /{id}:
 *   delete:
 *     description: Delete a token
 *     responses:
 *       204:
 *         description: Token deleted
 *       404:
 *         Entity not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const token = await TokenPair.findByPk(id)
  if (token === null) {
    return res.status(404).json({ error: 'Not found' })
  }
  await token.destroy()
  res.status(204).send()
})

export default router
