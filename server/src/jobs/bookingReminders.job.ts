import cron from "node-cron";
import { NotificationService } from "../services/notification.service";
import { prisma } from "../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../generated/prisma/browser";

const defaultIncludes = {
  customer: { select: { id: true, name: true, email: true, phone: true } },
  service: { select: { id: true, title: true } },
  technician: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
} as const;

/** An unpaid booking is cancelled this many minutes after it was created */
const PAYMENT_WINDOW_MINUTES = 60;
/** A "complete your payment" reminder is sent this many minutes before the auto-cancel deadline */
const PAYMENT_REMINDER_BEFORE_CANCEL_MINUTES = 10;

/** Wraps email dispatch so a broken SMTP/queue never kills the cron loop */
const safeNotify = async (action: () => Promise<void>): Promise<void> => {
  try {
    await action();
  } catch (err) {
    console.error("[ReminderJob] Email could not be sent:", err);
  }
};

/**
 * Auto-cancel unpaid bookings 1 hour after they were created, and send a
 * last-chance payment reminder email ~10 minutes before that deadline.
 *   Example: booking created at 4:00 PM → reminder at ~4:50 PM with booking
 *   details + payment link → cancelled at 5:00 PM if still unpaid.
 */
async function processPaymentDeadlines(now: Date) {
  const unpaidWhere = {
    paymentStatus: PaymentStatus.PENDING,
    status: { in: [BookingStatus.REQUESTED, BookingStatus.ACCEPTED] },
  };

  // 1. Auto-cancel bookings whose 1-hour payment window has expired
  const expiredBookings = await prisma.booking.findMany({
    where: {
      ...unpaidWhere,
      createdAt: {
        lte: new Date(now.getTime() - PAYMENT_WINDOW_MINUTES * 60 * 1000),
      },
    },
    include: defaultIncludes as any,
  });

  for (const booking of expiredBookings) {
    const cancellationReason =
      "Automatically cancelled — payment was not completed within 1 hour of creating the booking.";
    try {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason,
        },
      });
      await safeNotify(() =>
        NotificationService.sendBookingCancelled(
          booking as any,
          cancellationReason,
        ),
      );
      console.log(
        `[ReminderJob] Auto-cancelled unpaid booking ${booking.id} (payment window expired)`,
      );
    } catch (err) {
      console.error(
        `[ReminderJob] Failed to auto-cancel booking ${booking.id}:`,
        err,
      );
    }
  }

  // 2. Last-chance payment reminder (10 minutes before the deadline, sent once)
  const reminderCutoffMin = now.getTime() - PAYMENT_WINDOW_MINUTES * 60 * 1000;
  const reminderStartMin =
    now.getTime() -
    (PAYMENT_WINDOW_MINUTES - PAYMENT_REMINDER_BEFORE_CANCEL_MINUTES) *
      60 *
      1000;

  const bookingsForPaymentReminder = await prisma.booking.findMany({
    where: {
      ...unpaidWhere,
      paymentReminderSent: false,
      createdAt: {
        gt: new Date(reminderCutoffMin), // deadline not yet passed (those were cancelled above)
        lte: new Date(reminderStartMin), // deadline less than 10 minutes away
      },
    },
    include: defaultIncludes as any,
  });

  for (const booking of bookingsForPaymentReminder) {
    const createdAt = new Date(booking.createdAt).getTime();
    const deadline = createdAt + PAYMENT_WINDOW_MINUTES * 60 * 1000;
    const minutesRemaining = Math.max(
      1,
      Math.round((deadline - now.getTime()) / 60000),
    );

    await safeNotify(() =>
      NotificationService.sendPaymentDeadlineReminder(
        booking as any,
        minutesRemaining,
      ),
    );
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentReminderSent: true },
    });
  }
}

export function initializeReminderCronJobs() {
  // Runs every minute so the payment-deadline reminder lands close to exactly
  // 10 minutes before the 1-hour auto-cancellation deadline and unpaid
  // bookings are cancelled promptly once their 1-hour window expires.
  //   Example: booking created at 4:00 PM → payment reminder at ~4:50 PM with
  //   booking details + payment URL → cancelled at 5:00 PM if still unpaid.
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // 0. Unpaid bookings: payment reminder + 1-hour auto-cancel
      await processPaymentDeadlines(now);

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
        include: defaultIncludes as any,
      });

      for (const booking of bookingsFor24h) {
        await safeNotify(() =>
          NotificationService.sendBookingReminder24h(booking as any),
        );
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
        include: defaultIncludes as any,
      });

      for (const booking of bookingsFor2h) {
        await safeNotify(() =>
          NotificationService.sendBookingReminder2h(booking as any),
        );
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminder2hSent: true },
        });
      }

      // 3. Review Reminders (sent once, 24 hours after completion, if no review given)
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const unreviewedCompleted = await prisma.booking.findMany({
        where: {
          status: BookingStatus.COMPLETED,
          reviewReminderSent: false,
          completedAt: { lte: twentyFourHoursAgo },
          review: { is: null },
        },
        include: defaultIncludes as any,
      });

      for (const booking of unreviewedCompleted) {
        await safeNotify(() =>
          NotificationService.sendReviewReminder(booking as any),
        );
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reviewReminderSent: true },
        });
      }

      // 4. Stale REQUESTED reminders to technicians (max once every 12 hours)
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const staleRequests = await prisma.booking.findMany({
        where: {
          status: BookingStatus.REQUESTED,
          OR: [
            { lastTechnicianRemindedAt: null },
            { lastTechnicianRemindedAt: { lte: twelveHoursAgo } },
          ],
        },
        include: defaultIncludes as any,
      });

      for (const booking of staleRequests) {
        await safeNotify(() =>
          NotificationService.sendTechnicianBookingReminder(booking as any),
        );
        await prisma.booking.update({
          where: { id: booking.id },
          data: { lastTechnicianRemindedAt: new Date() },
        });
      }
    } catch (err) {
      console.error("[ReminderJob] Cron cycle failed:", err);
    }
  });
}
