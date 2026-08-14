import { emailQueue } from '../queues/emailQueue';
import { EmailRenderer } from '../utils/emailRenderer';
import { env } from '../config/env.config';

export enum NotificationEvent {
    BOOKING_CREATED = 'BOOKING_CREATED',
    BOOKING_ACCEPTED = 'BOOKING_ACCEPTED',
    BOOKING_DECLINED = 'BOOKING_DECLINED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
    BOOKING_REMINDER_24H = 'BOOKING_REMINDER_24H',
    BOOKING_REMINDER_2H = 'BOOKING_REMINDER_2H',
    BOOKING_STARTED = 'BOOKING_STARTED',
    BOOKING_COMPLETED = 'BOOKING_COMPLETED',
    REVIEW_REQUESTED = 'REVIEW_REQUESTED',
    REVIEW_REMINDER = 'REVIEW_REMINDER',
    TECHNICIAN_BOOKING_REMINDER = 'TECHNICIAN_BOOKING_REMINDER',
}

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
    private static async dispatch(idempotencyKey: string, to: string, subject: string, html: string) {
        await emailQueue.add(
            'sendEmail',
            { idempotencyKey, to, subject, html },
            {
                jobId: idempotencyKey, // Enforces Redis queue idempotency
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
            }
        );
    }

    // 1. BOOKING_CREATED
    public static async sendBookingCreated(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const formattedPrice = EmailRenderer.formatCurrency(booking.totalPrice);

        // Customer Email
        const customerHtml = await EmailRenderer.render('bookingCreatedCustomer', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: formattedPrice,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_created_cust_${booking.id}`,
            booking.customer.email,
            'Booking Request Received',
            customerHtml
        );

        // Technician Email
        const techHtml = await EmailRenderer.render('bookingCreatedTechnician', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: formattedPrice,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}/manage`,
        });
        await this.dispatch(
            `evt_created_tech_${booking.id}`,
            booking.technician.user.email,
            'New Booking Request',
            techHtml
        );
    }

    // 2. BOOKING_ACCEPTED
    public static async sendBookingAccepted(booking: BookingPayload): Promise<void> {
        const html = await EmailRenderer.render('bookingAccepted', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_accepted_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Accepted',
            html
        );
    }

    // 3. BOOKING_DECLINED
    public static async sendBookingDeclined(booking: BookingPayload, reason?: string): Promise<void> {
        const html = await EmailRenderer.render('bookingDeclined', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
            scheduledTime: booking.scheduledTime,
            bookingId: booking.id,
            declineReason: reason || booking.declineReason,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
            browseUrl: `${env.FRONTEND_URL}/customer/bookings`,
        });
        await this.dispatch(
            `evt_declined_${booking.id}`,
            booking.customer.email,
            'Your Booking Request Was Declined',
            html
        );
    }

    // 4. PAYMENT_SUCCESS
    public static async sendPaymentSuccess(payment: PaymentPayload): Promise<void> {
        const formattedAmount = EmailRenderer.formatCurrency(payment.amount);
        const formattedDate = EmailRenderer.formatDate(payment.booking.scheduledDate);

        // Customer Email
        const customerHtml = await EmailRenderer.render('paymentSuccessCustomer', {
            customerName: payment.booking.customer.name,
            serviceTitle: payment.booking.service.title,
            technicianName: payment.booking.technician.user.name,
            amount: formattedAmount,
            transactionId: payment.transactionId,
            scheduledDate: formattedDate,
            scheduledTime: payment.booking.scheduledTime,
            customerAddress: payment.booking.customerAddress,
            bookingId: payment.booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${payment.booking.id}`,
        });
        await this.dispatch(
            `evt_pay_success_cust_${payment.transactionId}`,
            payment.booking.customer.email,
            'Payment Successful — Booking Confirmed',
            customerHtml
        );

        // Technician Email
        const techHtml = await EmailRenderer.render('paymentSuccessTechnician', {
            technicianName: payment.booking.technician.user.name,
            customerName: payment.booking.customer.name,
            serviceTitle: payment.booking.service.title,
            amount: formattedAmount,
            transactionId: payment.transactionId,
            scheduledDate: formattedDate,
            scheduledTime: payment.booking.scheduledTime,
            bookingId: payment.booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${payment.booking.id}`,
        });
        await this.dispatch(
            `evt_pay_success_tech_${payment.transactionId}`,
            payment.booking.technician.user.email,
            'Payment Received for Booking',
            techHtml
        );
    }

    // 5. PAYMENT_FAILED
    public static async sendPaymentFailed(booking: BookingPayload, amount: number): Promise<void> {
        const html = await EmailRenderer.render('paymentFailed', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            amount: EmailRenderer.formatCurrency(amount),
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}/payment`,
        });
        await this.dispatch(
            `evt_pay_failed_${booking.id}_${Date.now()}`, // Retries can send distinct emails
            booking.customer.email,
            'Payment Failed',
            html
        );
    }

    // 6. BOOKING_CANCELLED
    public static async sendBookingCancelled(booking: BookingPayload, reason?: string): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer Email
        const customerHtml = await EmailRenderer.render('bookingCancelledCustomer', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            bookingId: booking.id,
            cancellationReason: reason || booking.cancellationReason,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_cancel_cust_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Cancelled',
            customerHtml
        );

        // Technician Email
        const techHtml = await EmailRenderer.render('bookingCancelledTechnician', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            bookingId: booking.id,
            cancellationReason: reason || booking.cancellationReason,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_cancel_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Cancelled',
            techHtml
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
        const custHtml = await EmailRenderer.render('bookingRescheduled', {
            recipientName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            oldDate: formattedOldDate,
            oldTime: oldTime,
            newDate: formattedNewDate,
            newTime: booking.scheduledTime,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_resched_cust_${booking.id}_${booking.scheduledDate.getTime()}`,
            booking.customer.email,
            'Your Booking Has Been Rescheduled',
            custHtml
        );

        // Technician
        const techHtml = await EmailRenderer.render('bookingRescheduled', {
            recipientName: booking.technician.user.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            oldDate: formattedOldDate,
            oldTime: oldTime,
            newDate: formattedNewDate,
            newTime: booking.scheduledTime,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_resched_tech_${booking.id}_${booking.scheduledDate.getTime()}`,
            booking.technician.user.email,
            'Your Booking Has Been Rescheduled',
            techHtml
        );
    }

    // 8. BOOKING_REMINDER_24H
    public static async sendBookingReminder24h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        const custHtml = await EmailRenderer.render('bookingReminder24hCustomer', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_rem_24h_cust_${booking.id}`,
            booking.customer.email,
            'Reminder: Your Service Is Tomorrow',
            custHtml
        );

        // Technician
        const techHtml = await EmailRenderer.render('bookingReminder24hTechnician', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_rem_24h_tech_${booking.id}`,
            booking.technician.user.email,
            'Reminder: You Have a Service Tomorrow',
            techHtml
        );
    }

    // 9. BOOKING_REMINDER_2H
    public static async sendBookingReminder2h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        const custHtml = await EmailRenderer.render('bookingReminder2hCustomer', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_rem_2h_cust_${booking.id}`,
            booking.customer.email,
            'Your Service Starts Soon',
            custHtml
        );

        // Technician
        const techHtml = await EmailRenderer.render('bookingReminder2hTechnician', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_rem_2h_tech_${booking.id}`,
            booking.technician.user.email,
            'Your Service Appointment Starts Soon',
            techHtml
        );
    }

    // 10. BOOKING_STARTED
    public static async sendBookingStarted(booking: BookingPayload): Promise<void> {
        const html = await EmailRenderer.render('bookingStarted', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_started_${booking.id}`,
            booking.customer.email,
            'Your Service Has Started',
            html
        );
    }

    // 11. BOOKING_COMPLETED
    public static async sendBookingCompleted(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        // Customer
        const custHtml = await EmailRenderer.render('bookingCompletedCustomer', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}/review`,
        });
        await this.dispatch(
            `evt_completed_cust_${booking.id}`,
            booking.customer.email,
            'Your Service Has Been Completed',
            custHtml
        );

        // Technician
        const techHtml = await EmailRenderer.render('bookingCompletedTechnician', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}`,
        });
        await this.dispatch(
            `evt_completed_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Completed',
            techHtml
        );
    }

    // 12. REVIEW_REQUESTED
    public static async sendReviewRequest(booking: BookingPayload): Promise<void> {
        const html = await EmailRenderer.render('reviewRequested', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}/review`,
        });
        await this.dispatch(
            `evt_rev_req_${booking.id}`,
            booking.customer.email,
            'How Was Your Service?',
            html
        );
    }

    // 13. REVIEW_REMINDER
    public static async sendReviewReminder(booking: BookingPayload): Promise<void> {
        const html = await EmailRenderer.render('reviewReminder', {
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/customer/bookings/${booking.id}/review`,
        });
        await this.dispatch(
            `evt_rev_rem_${booking.id}`,
            booking.customer.email,
            "We'd Love to Hear Your Feedback",
            html
        );
    }

    // 14. TECHNICIAN_BOOKING_REMINDER
    public static async sendTechnicianBookingReminder(booking: BookingPayload): Promise<void> {
        const html = await EmailRenderer.render('technicianBookingReminder', {
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            serviceTitle: booking.service.title,
            scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            bookingId: booking.id,
            ctaUrl: `${env.FRONTEND_URL}/technician/bookings/${booking.id}/manage`,
        });
        await this.dispatch(
            `evt_tech_rem_${booking.id}_${Date.now()}`,
            booking.technician.user.email,
            'Pending Booking Request Requires Your Attention',
            html
        );
    }
}