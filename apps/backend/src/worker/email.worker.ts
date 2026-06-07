// email worker
import { Worker } from 'bullmq'
import { emailQueue } from '../queues/email.queue'

// Resolve the underlying redis client (emailQueue.client is a Promise<RedisClient>)
const initializeWorker = async () => {
  const redisClient = await emailQueue.client

  const emailWorker = new Worker(emailQueue.name, async job => {
    const { to, subject, text } = job.data

    // Simulate email sending (replace with actual email sending logic)
    console.log(`Sending email to ${to} with subject "${subject}" and text "${text}"`)

    // Simulate a delay for sending the email
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log(`Email sent to ${to}`)
  }, {
    // use the resolved client (or its options) for the worker connection
    connection: // prefer passing the client instance; fall back to client.options if available
      (redisClient as any).options ?? redisClient,
  })

  emailWorker.on('completed', job => {
    console.log(`Job ${job.id} completed successfully`)
  })

  emailWorker.on('failed', (job: any, err) => {
    console.error(`Job ${job.id} failed with error:`, err)
  })

  return emailWorker
}

export default initializeWorker()