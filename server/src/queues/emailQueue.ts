import { Queue, Worker, Job } from 'bullmq';
import config from '../config';
import transporter from '../utils/nodemailer';
import { EmailRenderer } from '../utils/emailRenderer';

// src/queues/emailQueue.ts
export interface EmailJobData {
    idempotencyKey: string;
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
}
// src/queues/emailQueue.ts


const queueName = 'email-notifications';

export const emailQueue = new Queue<EmailJobData>(queueName, {
    connection: { url: config.redis.url },
    defaultJobOptions: {
        removeOnComplete: true, // Or use { age: 60, count: 0 } for a 1-minute retention max
        removeOnFail: { age: 24 * 3600, count: 10 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
    },
});

export const emailWorker = new Worker<EmailJobData>(
    queueName,
    async (job: Job<EmailJobData>) => {
        const { to, subject, templateName, templateData, idempotencyKey } = job.data;

        // Render HTML inside worker execution step
        const html = await EmailRenderer.render(templateName, templateData);

        await transporter.sendMail({
            from: config.smtp.email_from,
            to,
            subject,
            html,
        });

    },
    {
        connection: { url: config.redis.url },
        concurrency: 5,
    }
);