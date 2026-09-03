import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
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

const redisUrl = config.redis.url || 'redis://localhost:6379';

export const emailQueue = new Queue<EmailJobData>(queueName, {
    connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
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

        await sendEmailWithTemplate({
            to,
            subject,
            templateName,
            templateData,
        });
    },
    {
        connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
        concurrency: 5,
    }
);

emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on('completed', (job) => {
    console.log(`[EmailWorker] Email sent ✔ ${job?.id}`);
});

/**
 * Send an email through the BullMQ queue when Redis is available.
 * If the queue cannot be reached (Redis is offline), the email is
 * sent directly via nodemailer so notifications are never lost.
 */
export async function enqueueEmail(jobData: EmailJobData): Promise<void> {
    try {
        await emailQueue.add(
            'sendEmail',
            { ...jobData },
            {
                jobId: jobData.idempotencyKey,
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true,
                removeOnFail: { age: 24 * 3600, count: 10 },
            }
        );
    } catch (err: any) {
        // Redis/Queue unavailable — send synchronously as a fallback so
        // important notifications (booking, payment, status updates) still arrive.
        console.warn(
            `[EmailQueue] Redis unavailable (${err?.message}). Sending "${jobData.templateName}" directly to ${jobData.to}.`
        );
        await sendDirect(jobData);
    }
}

async function sendDirect(jobData: EmailJobData): Promise<void> {
    const { to, subject, templateName, templateData } = jobData;
    const html = await EmailRenderer.render(templateName, templateData);

    await transporter.sendMail({
        from: config.smtp.email_from || `"FixItNow" <${config.smtp.user_name}>`,
        to,
        subject,
        html,
    });
}

async function sendEmailWithTemplate(
    jobData: Pick<EmailJobData, 'to' | 'subject' | 'templateName' | 'templateData'>
): Promise<void> {
    const html = await EmailRenderer.render(jobData.templateName, jobData.templateData);

    await transporter.sendMail({
        from: config.smtp.email_from || `"FixItNow" <${config.smtp.user_name}>`,
        to: jobData.to,
        subject: jobData.subject,
        html,
    });
}