// email worker
import { ConnectionOptions, Worker } from 'bullmq'
import { redisConnection } from '../config/redis.config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})

export const emailWorker = new Worker('email', async (job) => {
    const { type, email, token } = job.data

    if (type === 'verification') {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'verify your email address',
            html: `<a href="${process.env.FRONTEND_URL}/verify?token=${token}">Click here to verify</a>`
        })
    }
}, {
    connection: redisConnection as unknown as ConnectionOptions
})