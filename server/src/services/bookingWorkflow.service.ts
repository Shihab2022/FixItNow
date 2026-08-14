
import { BookingStatus, PaymentStatus, Role } from '../../generated/prisma/browser';
import { prisma } from '../lib/prisma';
import { NotificationService } from './notification.service';


const defaultIncludes = {
    customer: true,
    service: true,
    technician: {
        include: {
            user: true,
        },
    },
};

export class BookingWorkflowService {
    // Create a new booking
    public static async createBooking(data: {
        customerId: string;
        technicianId: string;
        serviceId: string;
        scheduledDate: Date;
        scheduledTime: string;
        customerAddress: string;
        totalPrice: number;
        notes?: string;
    }) {
        const booking = await prisma.booking.create({
            data: {
                ...data,
                status: BookingStatus.REQUESTED,
                paymentStatus: PaymentStatus.PENDING,
            },
            include: defaultIncludes,
        });

        // Fire Notification
        await NotificationService.sendBookingCreated(booking as any);
        return booking;
    }

    // Transition: REQUESTED -> ACCEPTED or DECLINED
    public static async respondToBookingRequest(
        bookingId: string,
        action: 'ACCEPT' | 'DECLINE',
        declineReason?: string
    ) {
        const current = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: defaultIncludes,
        });

        if (!current || current.status !== BookingStatus.REQUESTED) {
            throw new Error('Invalid state transition. Booking must be in REQUESTED status.');
        }

        if (action === 'ACCEPT') {
            const updated = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: BookingStatus.ACCEPTED },
                include: defaultIncludes,
            });

            await NotificationService.sendBookingAccepted(updated as any);
            return updated;
        } else {
            const updated = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.DECLINED,
                    declineReason,
                },
                include: defaultIncludes,
            });

            await NotificationService.sendBookingDeclined(updated as any, declineReason);
            return updated;
        }
    }

    // Handle Payment Completion Webhook / Transaction
    public static async handlePaymentSuccess(
        bookingId: string,
        transactionId: string,
        amount: number,
        gatewayData?: any
    ) {
        // Transaction enforcing atomic updates
        const { payment } = await prisma.$transaction(async (tx) => {
            // Check existing payment idempotency
            const existingPayment = await tx.payment.findUnique({
                where: { transactionId },
            });

            if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
                throw new Error('Payment already processed.');
            }

            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.PAID,
                    paymentStatus: PaymentStatus.COMPLETED,
                },
                include: defaultIncludes,
            });

            const updatedPayment = await tx.payment.upsert({
                where: { bookingId },
                create: {
                    bookingId,
                    customerId: updatedBooking.customerId,
                    amount,
                    transactionId,
                    status: PaymentStatus.COMPLETED,
                    paidAt: new Date(),
                    paymentGatewayData: gatewayData,
                },
                update: {
                    amount,
                    transactionId,
                    status: PaymentStatus.COMPLETED,
                    paidAt: new Date(),
                    paymentGatewayData: gatewayData,
                },
            });

            return { booking: updatedBooking, payment: updatedPayment };
        });

        const fullBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: defaultIncludes,
        });

        // Send notifications
        await NotificationService.sendPaymentSuccess({
            id: payment.id,
            amount: payment.amount,
            transactionId: payment.transactionId,
            booking: fullBooking as any,
        });

        return payment;
    }

    // Handle Payment Failure
    public static async handlePaymentFailure(bookingId: string, amount: number) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: defaultIncludes,
        });

        if (!booking) throw new Error('Booking not found');

        await prisma.payment.upsert({
            where: { bookingId },
            create: {
                bookingId,
                customerId: booking.customerId,
                amount,
                transactionId: `FAILED_${Date.now()}_${bookingId.slice(0, 8)}`,
                status: PaymentStatus.FAILED,
            },
            update: {
                status: PaymentStatus.FAILED,
            },
        });

        await NotificationService.sendPaymentFailed(booking as any, amount);
    }

    // Transition: Reschedule Booking
    public static async rescheduleBooking(
        bookingId: string,
        newDate: Date,
        newTime: string,
        rescheduledBy: Role
    ) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: defaultIncludes,
        });

        const inactiveStatuses: BookingStatus[] = [
            BookingStatus.CANCELLED,
            BookingStatus.COMPLETED,
            BookingStatus.DECLINED,
        ];

        if (!booking || inactiveStatuses.includes(booking.status as BookingStatus)) {
            throw new Error('Cannot reschedule an inactive or finalized booking');
        }

        const oldDate = booking.scheduledDate;
        const oldTime = booking.scheduledTime;

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                scheduledDate: newDate,
                scheduledTime: newTime,
                rescheduledAt: new Date(),
                rescheduledBy,
                reminder24hSent: false, // Reset reminder flags for new timing
                reminder2hSent: false,
            },
            include: defaultIncludes,
        });

        await NotificationService.sendBookingRescheduled(updated as any, oldDate, oldTime);
        return updated;
    }

    // Transition: Cancel Booking
    public static async cancelBooking(bookingId: string, cancellationReason: string, cancelledBy: Role) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: defaultIncludes,
        });

        if (!booking || booking.status === BookingStatus.COMPLETED) {
            throw new Error('Cannot cancel completed bookings');
        }

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancellationReason,
                cancelledBy,
                cancelledAt: new Date(),
            },
            include: defaultIncludes,
        });

        await NotificationService.sendBookingCancelled(updated as any, cancellationReason);
        return updated;
    }

    // Transition: Start Service
    public static async startBooking(bookingId: string) {
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
            include: defaultIncludes,
        });

        await NotificationService.sendBookingStarted(updated as any);
        return updated;
    }

    // Transition: Complete Service
    public static async completeBooking(bookingId: string) {
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                completedAt: new Date(),
            },
            include: defaultIncludes,
        });

        await NotificationService.sendBookingCompleted(updated as any);
        await NotificationService.sendReviewRequest(updated as any);
        return updated;
    }
}