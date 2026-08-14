import { Queue, Worker, Job } from 'bullmq';
import config from '../config';
import { env } from 'process';
import transporter from '../utils/nodemailer';


export interface EmailJobData {
    idempotencyKey: string;
    to: string;
    subject: string;
    html: string;
}

const queueName = 'email-notifications';

export const emailQueue = new Queue<EmailJobData>(queueName, {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
    },
});

export const emailWorker = new Worker<EmailJobData>(
    queueName,
    async (job: Job<EmailJobData>) => {
        const { to, subject, html, idempotencyKey } = job.data;

        // Delivery via SMTP
        await transporter.sendMail({
            from: config.smtp.email_from,
            to,
            subject,
            html,
        });

        console.log(`[Email Delivered] ID: ${job.id} | Key: ${idempotencyKey} | To: ${to}`);
    },
    {
        connection: {
            host: config.redis.host,
            port: config.redis.port,
        },
        concurrency: 5,
    }
);

emailWorker.on('failed', (job, err) => {
    console.error(`[Email Job Failed] Job ID ${job?.id} failed with error: ${err.message}`);
});