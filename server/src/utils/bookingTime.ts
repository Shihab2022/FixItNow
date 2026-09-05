import config from '../config';

/**
 * Booking-time helpers
 * --------------------
 * Bookings are stored as:
 *   - `scheduledDate`: the calendar date (sent by the client as UTC-midnight ISO)
 *   - `scheduledTime`: a display string for the slot, e.g. "08:00 AM - 04:00 PM"
 *
 * The slot times are wall-clock times in the platform timezone (Asia/Dhaka by
 * default), so these helpers resolve the real UTC instant of a booking and
 * power the "cancel until 2 hours before" and "hide past slots today" rules
 * regardless of the server's own timezone (UTC on Vercel).
 */

/** IANA timezone the platform operates in (booking slots are local to it) */
export const PLATFORM_TIMEZONE = config.timezone || 'Asia/Dhaka';

/** Cancellation is allowed until this many hours before the scheduled start */
export const CANCELLATION_WINDOW_HOURS = 2;

/** Parse "08:00" or "08:00 AM" into minutes since midnight */
export const parseTimeToMinutes = (time: string): number | null => {
    if (!time) return null;
    const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
};

/**
 * Extract the START time (minutes since midnight) of a scheduled slot.
 * Accepts a range string like "08:00 AM - 04:00 PM" (stored value) or a plain
 * "08:00" / "08:00 AM" value.
 */
export const parseSlotStartMinutes = (scheduledTime: string): number | null => {
    if (!scheduledTime) return null;
    const firstPart = scheduledTime.split('-')[0]?.trim() ?? '';
    return parseTimeToMinutes(firstPart);
};

/** Offset (ms) to add to a UTC instant to get wall-clock time in `timeZone` */
const getTimeZoneOffsetMs = (timeZone: string, instant: Date): number => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const parts = formatter.formatToParts(instant);
    const get = (type: string) =>
        Number(parts.find((p) => p.type === type)?.value ?? '0');
    const asUtc = Date.UTC(
        get('year'),
        get('month') - 1,
        get('day'),
        get('hour') % 24,
        get('minute'),
        get('second'),
    );
    return asUtc - instant.getTime();
};

/**
 * Resolve the real UTC instant when a booking starts:
 * scheduledDate (UTC midnight of the calendar date) + slot start time,
 * interpreted in the platform timezone.
 * Returns null when the value cannot be parsed.
 */
export const resolveScheduledInstant = (
    scheduledDate: Date | string,
    scheduledTime: string
): Date | null => {
    const startMinutes = parseSlotStartMinutes(scheduledTime || '');
    if (startMinutes === null || !scheduledDate) return null;

    const base = new Date(scheduledDate);
    if (isNaN(base.getTime())) return null;

    const dateKey = base.toISOString().slice(0, 10); // YYYY-MM-DD
    const [yRaw, moRaw, dRaw] = dateKey.split('-').map(Number);
    const y = yRaw ?? 1970;
    const mo = moRaw ?? 1;
    const d = dRaw ?? 1;

    // Treat the wall-clock time as if it were UTC, then correct by the
    // timezone's offset at that moment.
    const naiveUtc = Date.UTC(y, mo - 1, d, 0, startMinutes);
    const offset = getTimeZoneOffsetMs(
        PLATFORM_TIMEZONE,
        new Date(naiveUtc)
    );
    return new Date(naiveUtc - offset);
};

/** Current wall-clock date key (YYYY-MM-DD) and minutes since midnight in the platform timezone */
export const nowInPlatformTimezone = (): { dateKey: string; minutes: number } => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: PLATFORM_TIMEZONE,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? '0';
    return {
        dateKey: `${get('year')}-${get('month')}-${get('day')}`,
        minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
    };
};

/**
 * True when the booking is still cancellable: more than
 * CANCELLATION_WINDOW_HOURS remain before the scheduled start.
 */
export const isWithinCancellationWindow = (booking: {
    scheduledDate: Date | string;
    scheduledTime: string;
}): boolean => {
    const start = resolveScheduledInstant(
        booking.scheduledDate,
        booking.scheduledTime
    );
    if (!start) return false; // cannot verify window — stay on the safe side
    const cutoff = start.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
    return Date.now() > cutoff;
};
