import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../config';
import transporter from '../utils/nodemailer';
import { EmailRenderer } from '../utils/emailRenderer';

// src/queues/emailQueue.ts
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    cid?: string;
}

export interface EmailJobData {
    idempotencyKey: string;
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: EmailAttachment[];
}
// src/queues/emailQueue.ts


const queueName = 'email-notifications';

const redisUrl = config.redis.url || 'redis://localhost:6379';

/**
 * BullMQ is only usable when a long-lived Redis connection AND a running
 * worker exist. On Vercel serverless the process freezes right after the
 * response, so queued jobs would never be processed (emails silently lost).
 * In that case — or when Redis is not configured at all — emails are sent
 * directly via SMTP so notifications ALWAYS go out.
 */
const isServerless = Boolean(process.env.VERCEL);
const redisConfigured = Boolean(config.redis?.url || config.redis?.host);
const shouldUseQueue = redisConfigured && !isServerless;

/** Max time (ms) to wait for the queue to accept a job before falling back to a direct send */
const QUEUE_ACCEPT_TIMEOUT_MS = 3000;

const connection = shouldUseQueue
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : null;

export const emailQueue = shouldUseQueue && connection
    ? new Queue<EmailJobData>(queueName, {
          connection,
          defaultJobOptions: {
              removeOnComplete: true, // Or use { age: 60, count: 0 } for a 1-minute retention max
              removeOnFail: { age: 24 * 3600, count: 10 },
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
          },
      })
    : null;

export const emailWorker = shouldUseQueue && connection
    ? new Worker<EmailJobData>(
          queueName,
          async (job: Job<EmailJobData>) => {
              const { to, subject, templateName, templateData, idempotencyKey, attachments } = job.data;

              await sendEmailWithTemplate({
                  to,
                  subject,
                  templateName,
                  templateData,
                  attachments,
              });
          },
          {
              connection,
              concurrency: 5,
          }
      )
    : null;

if (emailWorker) {
    emailWorker.on('failed', (job, err) => {
        console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
    });

    emailWorker.on('completed', (job) => {
        console.log(`[EmailWorker] Email sent ✔ ${job?.id}`);
    });
}

/**
 * Send an email through the BullMQ queue when Redis is available.
 * If the queue is unusable (no Redis, serverless environment, or the queue
 * does not accept the job in time) the email is sent directly via
 * nodemailer so notifications are never lost.
 */
export async function enqueueEmail(jobData: EmailJobData): Promise<void> {
    if (!emailQueue) {
        // No usable queue (Redis not configured or serverless environment) —
        // send synchronously so booking/payment/status notifications always arrive.
        await sendDirect(jobData);
        return;
    }

    try {
        await Promise.race([
            emailQueue.add(
                'sendEmail',
                { ...jobData },
                {
                    jobId: jobData.idempotencyKey,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                    removeOnComplete: true,
                    removeOnFail: { age: 24 * 3600, count: 10 },
                }
            ),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error('Redis queue accept timeout')),
                    QUEUE_ACCEPT_TIMEOUT_MS
                )
            ),
        ]);
    } catch (err: any) {
        // Redis/Queue unavailable — send synchronously as a fallback so
        // important notifications (booking, payment, status updates) still arrive.
        console.warn(
            `[EmailQueue] Queue unavailable (${err?.message}). Sending "${jobData.templateName}" directly to ${jobData.to}.`
        );
        await sendDirect(jobData);
    }
}

async function sendDirect(jobData: EmailJobData): Promise<void> {
    const { to, subject, templateName, templateData, attachments } = jobData;
    const html = await EmailRenderer.render(templateName, templateData);

    await transporter.sendMail({
        from: config.smtp.email_from || `"FixItNow" <${config.smtp.user_name}>`,
        to,
        subject,
        html,
        attachments,
    });
}

async function sendEmailWithTemplate(
    jobData: Pick<EmailJobData, 'to' | 'subject' | 'templateName' | 'templateData' | 'attachments'>
): Promise<void> {
    const html = await EmailRenderer.render(jobData.templateName, jobData.templateData);

    await transporter.sendMail({
        from: config.smtp.email_from || `"FixItNow" <${config.smtp.user_name}>`,
        to: jobData.to,
        subject: jobData.subject,
        html,
        attachments: jobData.attachments,
    });
}