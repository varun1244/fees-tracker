import Redis from 'ioredis'

const url = process.env.REDIS_URL
if (url === undefined) {
  throw new Error('Missing REDIS_URL')
}

export default new Redis(url, {
  maxRetriesPerRequest: null
})
