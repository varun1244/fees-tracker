import { Queue, Worker, type Job, type JobsOptions, BulkJobOptions } from "bullmq";
import ioRedis from 'ioredis'

export type JobQueueConfig = {
  queueName: string
  connection: ioRedis
}
export default class JobQueue<T> {
  queue: Queue;
  queueName: string;
  connection: ioRedis;
  constructor(config: JobQueueConfig) {
    this.queueName = config.queueName
    this.connection = config.connection
    this.queue = new Queue(config.queueName, {
      connection: config.connection,

      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      }
    })
  }

  addJob = (id: string, data: Array<T>, options?: JobsOptions) => {
    return this.queue.add(id, data, options);
  }

  getQueue = () => this.queue

  // addBulkJob = (name: string, data: Array<T>, options?: BulkJobOptions) => {
  //   return this.queue.addBulk({
  //     // name,
  //     data,
  //     opts: options
  //   })
  // }

  registerWorker = (name: string, worker: (job: Job<Array<T>>) => Promise<any>) => {
    return new Worker(this.queueName, worker, {
      connection: this.connection,
      autorun: true,
      name
    });
  }
}
