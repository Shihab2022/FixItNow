/* Quick render test: verifies every booking/payment template renders with the exact
 * data NotificationService passes. Run from server/: npx tsx scripts/testEmailTemplates.ts */
import ejs from "ejs";
import path from "path";

const templatesDir = path.join(process.cwd(), "src", "templates");
const baseUrl = "http://localhost:3000";

const bookingInfo = {
  serviceTitle: "AC Repair Service",
  scheduledDate: "Saturday, September 5, 2026",
  scheduledTime: "08:00 AM - 12:00 PM",
  customerAddress: "House 12, Road 5, Dhanmondi, Dhaka",
  totalPrice: "BDT 1,500.00",
  bookingId: "test-booking-id-123",
};

const customerContact = {
  customerName: "John Doe",
  customerPhone: "+8801800000000",
  customerEmail: "john@example.com",
};
const technicianContact = {
  technicianName: "Tech One",
  technicianPhone: "+8801700000000",
  technicianEmail: "tech@example.com",
};
const custUrl = `${baseUrl}/booking/customer/test`;
const custList = `${baseUrl}/dashboard/customer/bookings`;
const techList = `${baseUrl}/dashboard/technician/bookings`;

const cases: Array<[string, Record<string, any>]> = [
  ["bookingCreatedCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, ctaUrl: custUrl }],
  ["bookingCreatedTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, ctaUrl: techList }],
  ["bookingAccepted", { ...customerContact, ...technicianContact, ...bookingInfo, ctaUrl: custUrl }],
  ["bookingDeclined", { ...customerContact, ...technicianContact, ...bookingInfo, declineReason: "Not available", ctaUrl: custList, browseUrl: custList }],
  ["paymentSuccessCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, amount: "BDT 1,500.00", transactionId: "Fix-It-Now-123", ctaUrl: custUrl }],
  ["paymentSuccessTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, amount: "BDT 1,500.00", transactionId: "Fix-It-Now-123", ctaUrl: techList }],
  ["paymentFailed", { ...customerContact, ...technicianContact, serviceTitle: "AC Repair Service", scheduledDate: "Saturday, September 5, 2026", scheduledTime: "08:00 AM - 12:00 PM", amount: "BDT 1,500.00", bookingId: "test-booking-id-123", ctaUrl: custUrl }],
  ["bookingCancelledCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, cancellationReason: "Cancelled by customer", ctaUrl: custList }],
  ["bookingCancelledTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, cancellationReason: "Payment window expired", ctaUrl: techList }],
  ["bookingRescheduled", { recipientName: "John Doe", ...technicianContact, serviceTitle: "AC Repair Service", oldDate: "Friday, September 4, 2026", oldTime: "09:00 AM - 11:00 AM", newDate: "Saturday, September 5, 2026", newTime: "08:00 AM - 12:00 PM", bookingId: "test-booking-id-123", ctaUrl: custUrl }],
  ["bookingReminder24hCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, ctaUrl: custUrl }],
  ["bookingReminder24hTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, ctaUrl: techList }],
  ["bookingReminder2hCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, ctaUrl: custUrl }],
  ["bookingReminder2hTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, ctaUrl: techList }],
  ["bookingStarted", { ...customerContact, ...technicianContact, serviceTitle: "AC Repair Service", bookingId: "test-booking-id-123", ctaUrl: custUrl }],
  ["bookingCompletedCustomer", { ...customerContact, ...technicianContact, ...bookingInfo, ctaUrl: custUrl }],
  ["bookingCompletedTechnician", { ...technicianContact, ...customerContact, ...bookingInfo, ctaUrl: techList }],
  ["reviewRequested", { ...customerContact, ...technicianContact, serviceTitle: "AC Repair Service", bookingId: "test-booking-id-123", ctaUrl: custUrl }],
  ["reviewReminder", { ...customerContact, ...technicianContact, serviceTitle: "AC Repair Service", bookingId: "test-booking-id-123", ctaUrl: custUrl }],
  ["technicianBookingReminder", { ...technicianContact, ...customerContact, ...bookingInfo, ctaUrl: techList }],
  ["paymentDeadlineReminder", { ...customerContact, ...technicianContact, ...bookingInfo, minutesRemaining: 10, ctaUrl: custUrl }],
  ["adminBookingAlert", { event: "New Booking Created", ...customerContact, ...technicianContact, ...bookingInfo, bookingsUrl: `${baseUrl}/dashboard/admin/bookings` }],
];

(async () => {
  let failed = 0;
  for (const [name, data] of cases) {
    try {
      const html = await ejs.renderFile(
        path.join(templatesDir, `${name}.ejs`),
        { ...data, baseUrl },
        { root: templatesDir }
      );
      console.log(`OK ${name} (${html.length} chars)`);
    } catch (err: any) {
      failed++;
      console.error(`FAIL ${name}: ${err?.message}`);
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} template(s) FAILED to render`);
    process.exit(1);
  }
  console.log("\nAll templates rendered successfully.");
})();
