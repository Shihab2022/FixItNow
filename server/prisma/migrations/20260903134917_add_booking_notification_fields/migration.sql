-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "declineReason" TEXT,
ADD COLUMN     "lastTechnicianRemindedAt" TIMESTAMP(3),
ADD COLUMN     "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder2hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewReminderSent" BOOLEAN NOT NULL DEFAULT false;
