import Redis from "ioredis";

const url = process.env.REDIS_URL!

export default new Redis(url, {
  maxRetriesPerRequest: null
})
