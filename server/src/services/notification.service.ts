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
        phone?: string | null;
    };
    technician: {
        user: {
            email: string;
            name: string;
            phone?: string | null;
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
    // ------------------------------------------------------------------
    // Frontend URL helpers — every link points to a REAL page so the
    // buttons inside the emails never land on a 404 "not found" page.
    // ------------------------------------------------------------------
    /** Base URL with any trailing slash removed (config already normalizes it) */
    private static baseUrl(): string {
        return String(config.front_end_base_url || 'http://localhost:3000').replace(/\/+$/, '');
    }
    /** Customer booking details page (has Make Payment / Download Receipt buttons) */
    private static customerBookingUrl(bookingId: string): string {
        return `${this.baseUrl()}/booking/customer/${bookingId}`;
    }
    /** Customer bookings list */
    private static customerBookingsUrl(): string {
        return `${this.baseUrl()}/dashboard/customer/bookings`;
    }
    /** Technician bookings management page */
    private static technicianBookingsUrl(): string {
        return `${this.baseUrl()}/dashboard/technician/bookings`;
    }

    /** Support / platform inbox that receives operational copies (best-effort) */
    private static get adminEmail(): string | undefined {
        return config.contact?.email || config.admin?.email || undefined;
    }

    /**
     * Enqueue (or directly send) one email.
     *
     * Delivery is BEST-EFFORT: if one recipient's SMTP send fails, the error is
     * caught here so the remaining recipients (e.g. the technician when the
     * customer email fails, or the admin copy) are still sent. This guarantees
     * that every party always receives their own notification independently.
     */
    private static async dispatch(
        idempotencyKey: string,
        to: string,
        subject: string,
        templateName: string,
        templateData: Record<string, any>,
        attachments?: EmailAttachment[]
    ) {
        try {
            await enqueueEmail({ idempotencyKey, to, subject, templateName, templateData, attachments });
        } catch (err) {
            console.error(
                `[Notification] Email "${templateName}" to ${to} could not be sent:`,
                (err as Error)?.message || err,
            );
        }
    }

    /** Shared template data: booking details that go to BOTH parties */
    private static bookingInfo(booking: BookingPayload, formattedDate: string) {
        return {
            serviceTitle: booking.service.title,
            scheduledDate: formattedDate,
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
            bookingId: booking.id,
        };
    }

    /** Build the shared booking-details PDF (booking + both parties' contact info) */
    private static async bookingDetailsPdf(
        booking: BookingPayload,
        status: string
    ): Promise<EmailAttachment | undefined> {
        return this.bookingPdfAttachment({
            bookingId: booking.id,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            customerName: booking.customer.name,
            scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
            scheduledTime: booking.scheduledTime,
            customerAddress: booking.customerAddress,
            totalPrice: EmailRenderer.formatCurrency(booking.totalPrice),
            status,
            customerPhone: booking.customer.phone,
            customerEmail: booking.customer.email,
            technicianPhone: booking.technician.user.phone,
            technicianEmail: booking.technician.user.email,
        });
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
            customerPhone?: string | null;
            customerEmail?: string | null;
            technicianPhone?: string | null;
            technicianEmail?: string | null;
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
            customerName?: string;
            customerPhone?: string | null;
            technicianPhone?: string | null;
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
        const info = this.bookingInfo(booking, formattedDate);

        // Booking summary PDF goes to BOTH parties (customer + technician)
        const attachment = await this.bookingDetailsPdf(booking, 'Pending Technician Approval');

        // Customer Email — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_created_cust_${booking.id}`,
            booking.customer.email,
            'Booking Request Received',
            'bookingCreatedCustomer',
            {
                customerName: booking.customer.name,
                ...info,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                technicianEmail: booking.technician.user.email,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
        );

        // Technician Email — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_created_tech_${booking.id}`,
            booking.technician.user.email,
            'New Booking Request',
            'bookingCreatedTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                ctaUrl: this.technicianBookingsUrl(),
            },
            attachment ? [attachment] : undefined
        );

        // Operational copy to the platform support inbox (never blocks; skipped when unset)
        if (this.adminEmail) {
            await this.dispatch(
                `evt_created_admin_${booking.id}`,
                this.adminEmail,
                'New Booking Created on FixItNow',
                'adminBookingAlert',
                {
                    event: 'New Booking Created',
                    customerName: booking.customer.name,
                    customerEmail: booking.customer.email,
                    technicianName: booking.technician.user.name,
                    ...info,
                    bookingsUrl: `${config.front_end_base_url}/dashboard/admin/bookings`,
                }
            ).catch(() => undefined);
        }
    }

    // 2. BOOKING_ACCEPTED
    public static async sendBookingAccepted(booking: BookingPayload): Promise<void> {
        const attachment = await this.bookingDetailsPdf(booking, 'Accepted — Awaiting Payment');
        await this.dispatch(
            `evt_accepted_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Accepted',
            'bookingAccepted',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                technicianEmail: booking.technician.user.email,
                ...this.bookingInfo(booking, EmailRenderer.formatDate(booking.scheduledDate)),
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
        );
    }

    // 3. BOOKING_DECLINED
    public static async sendBookingDeclined(booking: BookingPayload, reason?: string): Promise<void> {
        const attachment = await this.bookingDetailsPdf(booking, 'Declined');
        await this.dispatch(
            `evt_declined_${booking.id}`,
            booking.customer.email,
            'Your Booking Request Was Declined',
            'bookingDeclined',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                ...this.bookingInfo(booking, EmailRenderer.formatDate(booking.scheduledDate)),
                declineReason: reason || booking.declineReason,
                ctaUrl: this.customerBookingsUrl(),
                browseUrl: this.customerBookingsUrl(),
            },
            attachment ? [attachment] : undefined
        );
    }

    // 4. PAYMENT_SUCCESS
    public static async sendPaymentSuccess(payment: PaymentPayload): Promise<void> {
        const booking = payment.booking;
        const formattedAmount = EmailRenderer.formatCurrency(payment.amount);
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);

        const info = {
            ...this.bookingInfo(booking, formattedDate),
            amount: formattedAmount,
            transactionId: payment.transactionId,
        };

        // Payment receipt PDF goes to BOTH parties (customer + technician)
        const payAttachment = await this.paymentPdfAttachment({
            transactionId: payment.transactionId,
            bookingId: booking.id,
            amount: formattedAmount,
            serviceTitle: booking.service.title,
            technicianName: booking.technician.user.name,
            scheduledDate: formattedDate,
            status: 'Successful',
            customerName: booking.customer.name,
            customerPhone: booking.customer.phone,
            technicianPhone: booking.technician.user.phone,
        });

        // Customer Email — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_pay_success_cust_${payment.transactionId}`,
            booking.customer.email,
            'Payment Successful — Booking Confirmed',
            'paymentSuccessCustomer',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                technicianEmail: booking.technician.user.email,
                ...info,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            payAttachment ? [payAttachment] : undefined
        );

        // Technician Email — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_pay_success_tech_${payment.transactionId}`,
            booking.technician.user.email,
            'Payment Received for Your Booking',
            'paymentSuccessTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                ctaUrl: this.technicianBookingsUrl(),
            },
            payAttachment ? [payAttachment] : undefined
        );

        // Operational copy to the platform support inbox
        if (this.adminEmail) {
            await this.dispatch(
                `evt_pay_success_admin_${payment.transactionId}`,
                this.adminEmail,
                'Payment Received on FixItNow',
                'adminBookingAlert',
                {
                    event: 'Payment Received',
                    customerName: booking.customer.name,
                    customerEmail: booking.customer.email,
                    technicianName: booking.technician.user.name,
                    ...info,
                    bookingsUrl: `${config.front_end_base_url}/dashboard/admin/bookings`,
                }
            ).catch(() => undefined);
        }
    }

    // 5. PAYMENT_FAILED
    public static async sendPaymentFailed(booking: BookingPayload, amount: number): Promise<void> {
        const attachment = await this.bookingDetailsPdf(booking, 'Payment Failed');
        await this.dispatch(
            `evt_pay_failed_${booking.id}_${Date.now()}`,
            booking.customer.email,
            'Payment Failed',
            'paymentFailed',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                serviceTitle: booking.service.title,
                scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
                scheduledTime: booking.scheduledTime,
                amount: EmailRenderer.formatCurrency(amount),
                bookingId: booking.id,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
        );
    }

    // 6. BOOKING_CANCELLED
    public static async sendBookingCancelled(booking: BookingPayload, reason?: string): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const info = this.bookingInfo(booking, formattedDate);

        const attachment = await this.bookingDetailsPdf(booking, 'Cancelled');

        // Customer Email — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_cancel_cust_${booking.id}`,
            booking.customer.email,
            'Your Booking Has Been Cancelled',
            'bookingCancelledCustomer',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                technicianEmail: booking.technician.user.email,
                ...info,
                cancellationReason: reason || booking.cancellationReason,
                ctaUrl: this.customerBookingsUrl(),
            },
            attachment ? [attachment] : undefined
        );

        // Technician Email — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_cancel_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Cancelled',
            'bookingCancelledTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                cancellationReason: reason || booking.cancellationReason,
                ctaUrl: this.technicianBookingsUrl(),
            },
            attachment ? [attachment] : undefined
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
        const eventKey = booking.scheduledDate.getTime();

        // Customer — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_resched_cust_${booking.id}_${eventKey}`,
            booking.customer.email,
            'Your Booking Has Been Rescheduled',
            'bookingRescheduled',
            {
                recipientName: booking.customer.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                oldDate: formattedOldDate,
                oldTime: oldTime,
                newDate: formattedNewDate,
                newTime: booking.scheduledTime,
                bookingId: booking.id,
                ctaUrl: this.customerBookingUrl(booking.id),
            }
        );

        // Technician — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_resched_tech_${booking.id}_${eventKey}`,
            booking.technician.user.email,
            'Your Booking Has Been Rescheduled',
            'bookingRescheduled',
            {
                recipientName: booking.technician.user.name,
                serviceTitle: booking.service.title,
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                oldDate: formattedOldDate,
                oldTime: oldTime,
                newDate: formattedNewDate,
                newTime: booking.scheduledTime,
                bookingId: booking.id,
                ctaUrl: this.technicianBookingsUrl(),
            }
        );
    }

    // 8. BOOKING_REMINDER_24H
    public static async sendBookingReminder24h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const info = this.bookingInfo(booking, formattedDate);
        const attachment = await this.bookingDetailsPdf(booking, 'Reminder');

        // Customer — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_rem_24h_cust_${booking.id}`,
            booking.customer.email,
            'Reminder: Your Service Is Tomorrow',
            'bookingReminder24hCustomer',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                ...info,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
        );

        // Technician — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_rem_24h_tech_${booking.id}`,
            booking.technician.user.email,
            'Reminder: You Have a Service Tomorrow',
            'bookingReminder24hTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                ctaUrl: this.technicianBookingsUrl(),
            },
            attachment ? [attachment] : undefined
        );
    }

    // 9. BOOKING_REMINDER_2H
    public static async sendBookingReminder2h(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const info = this.bookingInfo(booking, formattedDate);
        const attachment = await this.bookingDetailsPdf(booking, 'Reminder');

        // Customer — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_rem_2h_cust_${booking.id}`,
            booking.customer.email,
            'Your Service Starts Soon',
            'bookingReminder2hCustomer',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                ...info,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
        );

        // Technician — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_rem_2h_tech_${booking.id}`,
            booking.technician.user.email,
            'Your Service Appointment Starts Soon',
            'bookingReminder2hTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                ctaUrl: this.technicianBookingsUrl(),
            },
            attachment ? [attachment] : undefined
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
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                serviceTitle: booking.service.title,
                bookingId: booking.id,
                ctaUrl: this.customerBookingUrl(booking.id),
            }
        );
    }

    // 11. BOOKING_COMPLETED
    public static async sendBookingCompleted(booking: BookingPayload): Promise<void> {
        const formattedDate = EmailRenderer.formatDate(booking.scheduledDate);
        const info = this.bookingInfo(booking, formattedDate);

        const completedAttachment = await this.bookingDetailsPdf(booking, 'Completed');

        // Customer — includes the TECHNICIAN's contact info
        await this.dispatch(
            `evt_completed_cust_${booking.id}`,
            booking.customer.email,
            'Booking Completed',
            'bookingCompletedCustomer',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                technicianPhone: booking.technician.user.phone,
                technicianEmail: booking.technician.user.email,
                ...info,
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            completedAttachment ? [completedAttachment] : undefined
        );

        // Technician — includes the CUSTOMER's contact info
        await this.dispatch(
            `evt_completed_tech_${booking.id}`,
            booking.technician.user.email,
            'Booking Completed',
            'bookingCompletedTechnician',
            {
                technicianName: booking.technician.user.name,
                customerName: booking.customer.name,
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                ...info,
                ctaUrl: this.technicianBookingsUrl(),
            },
            completedAttachment ? [completedAttachment] : undefined
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
                technicianName: booking.technician.user.name,
                serviceTitle: booking.service.title,
                bookingId: booking.id,
                ctaUrl: this.customerBookingUrl(booking.id),
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
                technicianName: booking.technician.user.name,
                serviceTitle: booking.service.title,
                bookingId: booking.id,
                ctaUrl: this.customerBookingUrl(booking.id),
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
                customerPhone: booking.customer.phone,
                customerEmail: booking.customer.email,
                serviceTitle: booking.service.title,
                scheduledDate: EmailRenderer.formatDate(booking.scheduledDate),
                scheduledTime: booking.scheduledTime,
                customerAddress: booking.customerAddress,
                bookingId: booking.id,
                ctaUrl: this.technicianBookingsUrl(),
            }
        );
    }

    // 15. PAYMENT_DEADLINE_REMINDER — sent ~10 minutes before an unpaid
    // booking is auto-cancelled (1 hour after creation), with a direct
    // link to the booking page so the customer can still pay.
    public static async sendPaymentDeadlineReminder(
        booking: BookingPayload,
        minutesRemaining: number
    ): Promise<void> {
        const attachment = await this.bookingDetailsPdf(booking, 'Awaiting Payment');
        await this.dispatch(
            `evt_pay_deadline_${booking.id}`,
            booking.customer.email,
            `Action Required: Complete Your Payment Within ${Math.max(minutesRemaining, 1)} Minutes`,
            'paymentDeadlineReminder',
            {
                customerName: booking.customer.name,
                technicianName: booking.technician.user.name,
                ...this.bookingInfo(booking, EmailRenderer.formatDate(booking.scheduledDate)),
                minutesRemaining: Math.max(minutesRemaining, 1),
                ctaUrl: this.customerBookingUrl(booking.id),
            },
            attachment ? [attachment] : undefined
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