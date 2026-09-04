/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import ApiError from '../../helpars/ApiError';
import catchAsync from '../../helpars/catchAsync';
import sendResponse from '../../helpars/sendResponse';
import { enqueueEmail } from '../../queues/emailQueue';

const sanitize = (value: any): string =>
    String(value ?? '').trim().slice(0, 2000);

/** Validates + forwards a "Send us a Direct Message" form submission to the support inbox */
const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body || {};

    const senderName = sanitize(name);
    const senderEmail = sanitize(email || '');
    const emailSubject = sanitize(subject || '');
    const body = sanitize(message || '');

    if (!senderName || !senderEmail || !emailSubject || !body) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name, email, subject and message are all required.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Please enter a valid email address.');
    }

    const recipient = config.contact.email || config.admin.email;

    // Best-effort: the API still returns success when email dispatch fails,
    // but the error is logged server-side so the team can follow up.
    try {
        await enqueueEmail({
            idempotencyKey: `contact_${Date.now()}_${senderEmail}`,
            to: recipient,
            subject: `[FixItNow Contact] ${emailSubject}`,
            templateName: 'contactMessage',
            templateData: {
                senderName,
                senderEmail,
                subject: emailSubject,
                message: body,
                baseUrl: config.front_end_base_url,
            },
        });
    } catch (err: any) {
        console.error('[Contact] Failed to forward message:', err?.message);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Thank you! Your message has been received. Our team will get back to you shortly.',
        data: null,
    });
});

export const ContactController = {
    sendMessage,
};