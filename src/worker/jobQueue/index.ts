import { DefaultJobOptions, Queue, QueueEvents, Worker, type Job, type JobsOptions } from 'bullmq'
import type ioRedis from 'ioredis'

export interface JobQueueConfig {
  queueName: string
  connection: ioRedis
  default?: DefaultJobOptions
}

export default class JobQueue<T> {
  queue: Queue
  queueName: string
  connection: ioRedis
  listener: QueueEvents
  constructor(config: JobQueueConfig) {
    this.queueName = config.queueName
    this.connection = config.connection
    this.queue = new Queue(config.queueName, {
      connection: config.connection,

      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true
      }
    })
    this.listener = new QueueEvents(config.queueName, {
      connection: config.connection
    })
  }

  addJob = async (id: string, data: T[], options?: JobsOptions): Promise<Job<T>> => {
    return await this.queue.add(id, data, options)
  }

  getEventListener = () => this.listener

  getQueue = (): Queue<T> => this.queue

  registerWorker = (name: string, worker: (job: Job<T[]>) => Promise<any> | any): Worker<T[]> => {
    return new Worker(this.queueName, worker, {
      connection: this.connection,
      autorun: true,
      name
    })
  }

  destroy = () => {
    this.listener.close()
    this.queue.close()
  }
}
