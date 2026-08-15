import config from '../config';
import { emailQueue } from '../queues/emailQueue';
import { EmailRenderer } from '../utils/emailRenderer';

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
        templateData: Record<string, any>
    ) {
        await emailQueue.add(
            'sendEmail',
            { idempotencyKey, to, subject, templateName, templateData },
            {
                jobId: idempotencyKey,
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: { age: 2 * 3600, count: 5 },
                removeOnFail: { age: 24 * 3600, count: 10 },
            }
        );
    }

    // 1. BOOKING_CREATED
    public static async sendBookingCreated(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const formattedPrice = EmailRenderer.formatCurrency(booking.totalPrice);

        // Customer Email
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
            }
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
                bookingId: booking.id,
                ctaUrl: `${config.front_end_base_url}/customer/bookings/${booking.id}/review`,
            }
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
}