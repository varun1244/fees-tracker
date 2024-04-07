import { assert, expect } from 'chai';
import JobQueue, { JobQueueConfig } from '../../../src/worker/jobQueue'
import Redis from 'ioredis-mock'
import { type Job } from 'bullmq';
const redis = new Redis()

describe('JobQueue', function () {
  it('should instantiate JobQueue with valid JobQueueConfig object', () => {
    const config: JobQueueConfig = {
      queueName: 'testQueue',
      connection: redis
    };

    const jobQueue = new JobQueue(config);
    expect(jobQueue.queueName).to.be.equal(config.queueName)
    expect(jobQueue.queue).to.not.be.undefined;
  })
})
