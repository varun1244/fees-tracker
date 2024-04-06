import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     description: Get most recent transactions
 *     responses:
 *       200:
 *         description: List of transaction
 */
router.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

router.get('/hello/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

export default router;
