/* Sanity tests for booking time helpers. Run from server/: npx tsx scripts/testBookingTime.ts */
import {
  parseTimeToMinutes,
  parseSlotStartMinutes,
  resolveScheduledInstant,
  nowInPlatformTimezone,
  isWithinCancellationWindow,
} from "../src/utils/bookingTime";

let failed = 0;
const check = (label: string, actual: any, expected: any) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(`${ok ? "OK " : "FAIL"} ${label}: got ${JSON.stringify(actual)}${ok ? "" : `, expected ${JSON.stringify(expected)}`}`);
};

// 1. Time parsing
check("parse 08:00", parseTimeToMinutes("08:00"), 480);
check("parse 04:00 PM", parseTimeToMinutes("04:00 PM"), 960);
check("parse 12:30 AM", parseTimeToMinutes("12:30 AM"), 30);
check("parse 12:00 PM", parseTimeToMinutes("12:00 PM"), 720);
check("parse invalid", parseTimeToMinutes("abc"), null);

// 2. Slot start extraction from the stored range string
check("range start", parseSlotStartMinutes("08:00 AM - 04:00 PM"), 480);
check("range start 24h", parseSlotStartMinutes("14:00 - 16:00"), 840);
check("range start empty", parseSlotStartMinutes(""), null);

// 3. Instant resolution: 2026-09-05 08:00 AM Dhaka (UTC+6) === 02:00 UTC
const instant = resolveScheduledInstant("2026-09-05T00:00:00.000Z", "08:00 AM - 04:00 PM");
check("resolve slot instant (UTC)", instant ? instant.toISOString() : null, "2026-09-05T02:00:00.000Z");

// 4. Cancellation window
// Booking tomorrow 8:00 AM Dhaka → more than 2h away → NOT within window (cancellable)
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const tomorrowKey = tomorrow.toISOString().slice(0, 10);
check(
  "future booking cancellable",
  isWithinCancellationWindow({ scheduledDate: `${tomorrowKey}T00:00:00.000Z`, scheduledTime: "08:00 AM - 04:00 PM" }),
  false,
);
// Booking ~1h from now ( Dhaka wall clock) → within window → NOT cancellable
const soon = new Date(Date.now() + 1 * 60 * 60 * 1000 + 360 * 60 * 1000); // Dhaka wall time = now + 1h
const soonKey = soon.toISOString().slice(0, 10);
const soonMinutes = soon.getUTCHours() * 60 + soon.getUTCMinutes();
const pad = (n: number) => String(n).padStart(2, "0");
const soonTime = `${pad(Math.floor(soonMinutes / 60))}:${pad(soonMinutes % 60)} - 23:59`;
check(
  "booking <2h away locked",
  isWithinCancellationWindow({ scheduledDate: `${soonKey}T00:00:00.000Z`, scheduledTime: soonTime }),
  true,
);

// 5. nowInPlatformTimezone shape
const nowTz = nowInPlatformTimezone();
check("today dateKey format", /^\d{4}-\d{2}-\d{2}$/.test(nowTz.dateKey), true);
check(
  "today minutes in range",
  nowTz.minutes >= 0 && nowTz.minutes <= 1439,
  true,
);

if (failed > 0) {
  console.error(`\n${failed} test(s) FAILED`);
  process.exit(1);
}
console.log("\nAll booking-time tests passed.");
