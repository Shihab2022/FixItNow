import cron from 'node-cron';
// import { PrismaClient, BookingStatus } from '@prisma/client';
import { NotificationService } from '../services/notification.service';
import { prisma } from '../lib/prisma';
import { BookingStatus } from '../../generated/prisma/browser';


const defaultIncludes = {
    customer: true,
    service: true,
    technician: {
        include: {
            user: true,
        },
    },
};

export function initializeReminderCronJobs() {
    // Runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        const now = new Date();

        // 1. 24-Hour Reminders
        const in24HoursMin = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
        const in24HoursMax = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

        const bookingsFor24h = await prisma.booking.findMany({
            where: {
                status: { in: [BookingStatus.ACCEPTED, BookingStatus.PAID] },
                reminder24hSent: false,
                scheduledDate: {
                    gte: in24HoursMin,
                    lte: in24HoursMax,
                },
            },
            include: defaultIncludes,
        });

        for (const booking of bookingsFor24h) {
            await NotificationService.sendBookingReminder24h(booking as any);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { reminder24hSent: true },
            });
        }

        // 2. 2-Hour Reminders
        const in2HoursMin = new Date(now.getTime() + 1.75 * 60 * 60 * 1000);
        const in2HoursMax = new Date(now.getTime() + 2.25 * 60 * 60 * 1000);

        const bookingsFor2h = await prisma.booking.findMany({
            where: {
                status: { in: [BookingStatus.ACCEPTED, BookingStatus.PAID] },
                reminder2hSent: false,
                scheduledDate: {
                    gte: in2HoursMin,
                    lte: in2HoursMax,
                },
            },
            include: defaultIncludes,
        });

        for (const booking of bookingsFor2h) {
            await NotificationService.sendBookingReminder2h(booking as any);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { reminder2hSent: true },
            });
        }

        // 3. Review Reminders (Sent 24 hours after completion if no review given)
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const unreviewedCompleted = await prisma.booking.findMany({
            where: {
                status: BookingStatus.COMPLETED,
                reviewReminderSent: false,
                completedAt: { lte: twentyFourHoursAgo },
                review: { is: null },
            },
            include: defaultIncludes,
        });

        for (const booking of unreviewedCompleted) {
            await NotificationService.sendReviewReminder(booking as any);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { reviewReminderSent: true },
            });
        }

        // 4. Stale REQUESTED Booking Reminders to Technician (Every 12 hours)
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const staleRequests = await prisma.booking.findMany({
            where: {
                status: BookingStatus.REQUESTED,
                // OR: [
                //     { lastTechnicianRemindedAt: null },
                //     { lastTechnicianRemindedAt: { lte: twelveHoursAgo } },
                // ],
            },
            include: defaultIncludes,
        });

        for (const booking of staleRequests) {
            await NotificationService.sendTechnicianBookingReminder(booking as any);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { lastTechnicianRemindedAt: new Date() },
            });
        }
    });
}