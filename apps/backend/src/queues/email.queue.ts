import { Queue, type ConnectionOptions } from 'bullmq'
import { redisConnection } from '../config/redis.config'

// cast redisConnection to bullmq's ConnectionOptions to avoid type incompatibilities
export const emailQueue = new Queue('email', {
  connection: redisConnection as unknown as ConnectionOptions,
})