import { type FindOptions } from 'sequelize';
import TransactionHistory from '../../db/models/transactionHistory'
import { Router, type Request, type Response } from 'express'

const router = Router()
type PaginationQuery = {
  limit: number
  offset: number
}

function getDbQuery(req: Request, res: Response): FindOptions {
  const txnId = req.params.txnId
  if (txnId) {
    return {
      where: {
        "txn_id": req.params.txnId
      }
    }
  }

  const query: FindOptions = {
    limit: 10,
    offset: 0
  }
  Object.keys(query).forEach(key => {
    if (req.query[key]) {
      const val = req.query[key] as string
      query[key as keyof PaginationQuery] = parseInt(val) - 1
    }
  })

  const tokenId = res.locals['tokenId']
  if (tokenId !== undefined) {
    query.where = {
      'token_pair_id': parseInt(tokenId)
    }
  }
  return query
}

/**
 * @openapi
 * /:
 *   get:
 *     description: Get all transactions
 *     responses:
 *       200:
 *         description: All transactions
 */
router.get('/', async (req: Request, res: Response) => {
  let txns = await TransactionHistory.findAll(getDbQuery(req, res))
  res.json(txns.map(item => item.toJSON()))
})

/**
 * @openapi
 * /{id}:
 *   get:
 *     description: Get specific transaction information
 *     responses:
 *       200:
 *         description: Transaction data
 *       404:
 *         Entity not found
 */
router.get('/:txnId', async (req: Request, res: Response) => {
  let token = await TransactionHistory.findOne(getDbQuery(req, res))
  if (token == null || token.get('txnId') !== req.params.txnId) {
    res.status(404).json({ error: "Not found" })
  }
  res.json(token?.toJSON())
})

export default router
