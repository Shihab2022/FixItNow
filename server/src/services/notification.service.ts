import config from '../config';
import { enqueueEmail, EmailAttachment } from '../queues/emailQueue';
import { EmailRenderer } from '../utils/emailRenderer';
import { PdfGenerator } from '../utils/pdfGenerator';

export interface BookingPayload {
    id: string;
    scheduledDate: Date;
    scheduledTime: string;
    customerAddress: string;
    totalPrice: number;
    declineReason?: string | null;
    cancellationReason?: string | null;
    customer: {
        email: string;
        name: string;
    };
    technician: {
        user: {
            email: string;
            name: string;
        };
    };
    service: {
        title: string;
    };
}

export interface PaymentPayload {
    id: string;
    amount: number;
    transactionId: string;
    booking: BookingPayload;
}

export class NotificationService {
    private static async dispatch(
        idempotencyKey: string,
        to: string,
        subject: string,
        templateName: string,
        templateData: Record<string, any>,
        attachments?: EmailAttachment[]
    ) {
        await enqueueEmail({ idempotencyKey, to, subject, templateName, templateData, attachments });
    }

    /** Generate a booking PDF attachment best-effort; email still sends when generation fails */
    private static async bookingPdfAttachment(
        payload: {
            bookingId: string;
            serviceTitle: string;
            technicianName: string;
            customerName: string;
            scheduledDate: string;
            scheduledTime: string;
            customerAddress: string;
            totalPrice: string;
            status?: string;
            notes?: string;
        },
        filename: string = 'booking-details.pdf'
    ): Promise<EmailAttachment | undefined> {
        try {
            const invoice = PdfGenerator.buildBookingInvoice(payload);
            const buffer = await PdfGenerator.generatePdfBuffer(invoice);
            return { filename, content: buffer, contentType: 'application/pdf' };
        } catch (err) {
            console.warn('[Notification] PDF attachment could not be generated:', (err as Error)?.message);
            return undefined;
        }
    }

    /** Generate a payment receipt PDF attachment best-effort*/
    private static async paymentPdfAttachment(
        payload: {
            transactionId: string;
            bookingId: string;
            amount: string;
            serviceTitle: string;
            technicianName: string;
            scheduledDate: string;
            status?: string;
        },
        filename: string = 'payment-receipt.pdf'
    ): Promise<EmailAttachment | undefined> {
        try {
            const invoice = PdfGenerator.buildPaymentInvoice(payload);
            const buffer = await PdfGenerator.generatePdfBuffer(invoice);
            return { filename, content: buffer, contentType: 'application/pdf' };
        } catch (err) {
            console.warn('[Notification] Payment PDF attachment could not be generated:', (err as Error)?.message);
            return undefined;
        }
    }

    // 1. BOOKING_CREATED
    public static async sendBookingCreated(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const formattedPrice = EmailRenderer.formatCurrency(booking.totalPrice);

        // Customer Email
        const customerAttachment = await this.bookingPdfAttachment({
            bookingId: booking.id,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: formattedPrice,
            status: 'Pending Technician Approval',
        });
        await this.dispatch(
            `evt_created_cust_${booking.id}`,
            booking.customer.email,
            'Booking Request Received',
            'bookingCreatedCustomer',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                totalPrice: formattedPrice,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            },
            customerAttachment ? [customerAttachment] : undefined
        );

        // Technician Email
        await this.dispatch(
            `evt_created_tech_${booking.id}`,
            booking.technician.user.email,
            'New Booking Request',
            'bookingCreatedTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                totalPrice: formattedPrice,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}/manage`,
            }
        );
    }

    // 2. BOOKING_ACCEPTED
    public static async sendBookingAccepted(booking: BookingPayload): Promise<void> {
        await this.dispatch(
            `evt_accepted_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Accepted',
            'bookingAccepted',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );
    }

    // 3. BOOKING_DECLINED
    public static async sendBookingDeclined(booking: BookingPayload, reason?: string): Promise<void> {
        await this.dispatch(
            `evt_declined_${booking.id}`,
            booking.customer.email,
            'Your Booking Request Was Declined',
            'bookingDeclined',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
                scheduledTime: booking.scheduledTime,
                bookingId: booking.id,
                declineReason: reason || booking.declineReason,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
                browseUrl: `${config.front_end_base_url}/customer/bookings`,
            }
        );
    }

    // 4. PAYMENT_SUCCESS
    public static async sendPaymentSuccess(payment: PaymentPayload): Promise<void> {
        const formattedAmount = EmailRenderer.formatCurrency(payment.amount);
        const formattedDate = EmailRenderer.formatDate(payment.booking.scheduledDate);

        // Customer Email
        const payAttachment = await this.paymentPdfAttachment({
            transactionId: payment.transactionId,
            bookingId: payment.booking.id,
            amount: formattedAmount,
            serviceTitle: payment.booking.service.title,
            technicianName: payment.booking.technician.user.name,
            scheduledDate: formattedDate,
            status: 'Successful',
        });
        await this.dispatch(
            `evt_pay_success_cust_${payment.transactionId}`,
            payment.booking.customer.email,
            'Payment Successful — Booking Confirmed',
            'paymentSuccessCustomer',
            {
                customerName: payment.booking.customer.name,
                serviceTitle: payment.booking.service.title,
                technicianName: payment.booking.technician.user.name,
                amount: formattedAmount,
                transactionId: payment.transactionId,
                scheduledDate: formattedDate,
                scheduledTime: payment.booking.scheduledTime,
                customerAddress: payment.booking.customerAddress,
                bookingId: payment.booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${payment.booking.id}`,
            },
            payAttachment ? [payAttachment] : undefined
        );

        // Technician Email
        await this.dispatch(
            `evt_pay_success_tech_${payment.transactionId}`,
            payment.booking.technician.user.email,
            'Payment Received for Your Booking',
            'paymentSuccessTechnician',
            {
                technicianName: payment.booking.technician.user.name,
                customerName: payment.booking.customer.name,
                serviceTitle: payment.booking.service.title,
                amount: formattedAmount,
                transactionId: payment.transactionId,
                scheduledDate: formattedDate,
                scheduledTime: payment.booking.scheduledTime,
                customerAddress: payment.booking.customerAddress,
                bookingId: payment.booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${payment.booking.id}`,
            }
        );
    }

    // 5. PAYMENT_FAILED
    public static async sendPaymentFailed(booking: BookingPayload, amount: number): Promise<void> {
        await this.dispatch(
            `evt_pay_failed_${booking.id}_${Date.now()}`,
            booking.customer.email,
            'Payment Failed',
            'paymentFailed',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                amount: EmailRenderer.formatCurrency(amount),
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}/payment`,
            }
        );
    }

    // 6. BOOKING_CANCELLED
    public static async sendBookingCancelled(booking: BookingPayload, reason?: string): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer Email
        await this.dispatch(
            `evt_cancel_cust_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Cancelled',
            'bookingCancelledCustomer',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                bookingId: booking.id,
                cancellationReason: reason || booking.cancellationReason,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );

        // Technician Email
        await this.dispatch(
            `evt_cancel_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Cancelled',
            'bookingCancelledTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                bookingId: booking.id,
                cancellationReason: reason || booking.cancellationReason,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}`,
            }
        );
    }

    // 7. BOOKING_RESCHEDULED
    public static async sendBookingRescheduled(
        booking: BookingPayload,
        oldDate: Date,
        oldTime: string
    ): Promise<void> {
        const formattedOldDate = EmailRenderer.formatDate(oldDate);
        const formattedNewDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        await this.dispatch(
            `evt_resched_cust_${booking.id}_${booking.scheduledDate.getTime()}`,
            booking.customer.email,
            'Your Booking Has Been Rescheduled',
            'bookingRescheduled',
            {
                recipientName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                oldDate: formattedOldDate,
                oldTime: oldTime,
                newDate: formattedNewDate,
                newTime: booking.scheduledTime,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );

        // Technician
        await this.dispatch(
            `evt_resched_tech_${booking.id}_${booking.scheduledDate.getTime()}`,
            booking.technician.user.email,
            'Your Booking Has Been Rescheduled',
            'bookingRescheduled',
            {
                recipientName: booking.technician.user.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                oldDate: formattedOldDate,
                oldTime: oldTime,
                newDate: formattedNewDate,
                newTime: booking.scheduledTime,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}`,
            }
        );
    }

    // 8. BOOKING_REMINDER_24H
    public static async sendBookingReminder24h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        await this.dispatch(
            `evt_rem_24h_cust_${booking.id}`,
            booking.customer.email,
            'Reminder: Your Service Is Tomorrow',
            'bookingReminder24hCustomer',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );

        // Technician
        await this.dispatch(
            `evt_rem_24h_tech_${booking.id}`,
            booking.technician.user.email,
            'Reminder: You Have a Service Tomorrow',
            'bookingReminder24hTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}`,
            }
        );
    }

    // 9. BOOKING_REMINDER_2H
    public static async sendBookingReminder2h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        await this.dispatch(
            `evt_rem_2h_cust_${booking.id}`,
            booking.customer.email,
            'Your Service Starts Soon',
            'bookingReminder2hCustomer',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );

        // Technician
        await this.dispatch(
            `evt_rem_2h_tech_${booking.id}`,
            booking.technician.user.email,
            'Your Service Appointment Starts Soon',
            'bookingReminder2hTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}`,
            }
        );
    }

    // 10. BOOKING_STARTED
    public static async sendBookingStarted(booking: BookingPayload): Promise<void> {
        await this.dispatch(
            `evt_started_${booking.id}`,
            booking.customer.email,
            'Your Service Has Started',
            'bookingStarted',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}`,
            }
        );
    }

    // 11. BOOKING_COMPLETED
    public static async sendBookingCompleted(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        const completedAttachment = await this.bookingPdfAttachment({
            bookingId: booking.id,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime || '',
            customerAddress: booking.customerAddress,
            totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
            status: 'Completed',
        });
        await this.dispatch(
            `evt_completed_cust_${booking.id}`,
            booking.customer.email,
            'Your Service Has Been Completed',
            'bookingCompletedCustomer',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                scheduledDate: formattedDate,
                scheduledTime: booking.scheduledTime || '',
                customerAddress: booking.customerAddress,
                totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}/review`,
            },
            completedAttachment ? [completedAttachment] : undefined
        );

        // Technician
        await this.dispatch(
            `evt_completed_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Completed',
            'bookingCompletedTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: formattedDate,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}`,
            }
        );
    }

    // 12. REVIEW_REQUESTED
    public static async sendReviewRequest(booking: BookingPayload): Promise<void> {
        await this.dispatch(
            `evt_rev_req_${booking.id}`,
            booking.customer.email,
            'How Was Your Service?',
            'reviewRequested',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}/review`,
            }
        );
    }

    // 13. REVIEW_REMINDER
    public static async sendReviewReminder(booking: BookingPayload): Promise<void> {
        await this.dispatch(
            `evt_rev_rem_${booking.id}`,
            booking.customer.email,
            "We'd Love to Hear Your Feedback",
            'reviewReminder',
            {
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}/review`,
            }
        );
    }

    // 14. TECHNICIAN_BOOKING_REMINDER
    public static async sendTechnicianBookingReminder(booking: BookingPayload): Promise<void> {
        await this.dispatch(
            `evt_tech_rem_${booking.id}_${Date.now()}`,
            booking.technician.user.email,
            'Pending Booking Request Requires Your Attention',
            'technicianBookingReminder',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                serviceTitle: booking.service.title,
                scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/technician/bookings/${booking.id}/manage`,
            }
        );
    }

    // 15. JOB_REQUEST_APPLICATION_RECEIVED (technician applied to a customer's task)
    public static async sendJobRequestApplicationApplied(payload: {
        customer: { email: string; name: string };
        jobRequest: { id: string; title: string; category: { name: string } };
        technician: {
            profileId: string;
            name: string;
            skills: string[];
            experience: number;
            hourlyRate: number | null;
            rating: number;
            message?: string | null;
        };
    }): Promise<void> {
        await this.dispatch(
            `evt_job_app_${payload.jobRequest.id}_${payload.technician.profileId}_${Date.now()}`,
            payload.customer.email,
            'A Technician Wants to Work on Your Task',
            'jobRequestApplied',
            {
                customerName: payload.customer.name,
                taskTitle: payload.jobRequest.title,
                categoryName: payload.jobRequest.category.name,
                technicianName: payload.technician.name,
                skills: Array.isArray(payload.technician.skills)
                    ? payload.technician.skills.join(', ')
                    : '',
                experience: payload.technician.experience,
                hourlyRate:
                    payload.technician.hourlyRate == null
                        ? 'Not set'
                        : EmailRenderer.formatCurrency(payload.technician.hourlyRate),
                rating: payload.technician.rating,
                message: payload.technician.message || '',
                technicianUrl: `${config.front_end_base_url}/technicians/${payload.technician.profileId}`,
                taskUrl: `${config.front_end_base_url}/tasks/${payload.jobRequest.id}`,
            }
        );
    }

    // 16. JOB_REQUEST_APPLICATION_ACCEPTED (customer accepted a technician's application)
    public static async sendJobRequestApplicationAccepted(payload: {
        technician: { email: string; name: string };
        jobRequest: { id: string; title: string };
    }): Promise<void> {
        await this.dispatch(
            `evt_job_acc_${payload.jobRequest.id}_${payload.technician.name}_${Date.now()}`,
            payload.technician.email,
            'Great News! The Customer Accepted Your Application',
            'jobRequestAccepted',
            {
                technicianName: payload.technician.name,
                taskTitle: payload.jobRequest.title,
                taskUrl: `${config.front_end_base_url}/tasks/${payload.jobRequest.id}`,
            }
        );
    }
}