import { Queue, Worker, type Job, type JobsOptions } from 'bullmq'
import type ioRedis from 'ioredis'

export interface JobQueueConfig {
  queueName: string
  connection: ioRedis
}
export default class JobQueue<T> {
  queue: Queue
  queueName: string
  connection: ioRedis
  constructor (config: JobQueueConfig) {
    this.queueName = config.queueName
    this.connection = config.connection
    this.queue = new Queue(config.queueName, {
      connection: config.connection,

      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true
      }
    })
  }

  addJob = async (id: string, data: T[], options?: JobsOptions): Promise<Job<T>> => {
    return await this.queue.add(id, data, options)
  }

  getQueue = (): Queue<T> => this.queue

  registerWorker = (name: string, worker: (job: Job<T[]>) => Promise<any> | any): Worker<T[]> => {
    return new Worker(this.queueName, worker, {
      connection: this.connection,
      autorun: true,
      name
    })
  }
}
