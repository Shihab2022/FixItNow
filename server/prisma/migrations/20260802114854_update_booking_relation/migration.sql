/*
  Warnings:

  - Added the required column `scheduledTime` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerAddress` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_technicianId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "scheduledTime" TEXT NOT NULL,
ALTER COLUMN "customerAddress" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
