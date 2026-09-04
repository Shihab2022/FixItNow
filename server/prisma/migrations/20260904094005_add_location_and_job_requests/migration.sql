-- CreateEnum
CREATE TYPE "JobRequestStatus" AS ENUM ('OPEN', 'BOOKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobRequestApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "job_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'OPEN',
    "customerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_request_applications" (
    "id" TEXT NOT NULL,
    "status" "JobRequestApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "jobRequestId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_request_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_request_applications_jobRequestId_technicianId_key" ON "job_request_applications"("jobRequestId", "technicianId");

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_request_applications" ADD CONSTRAINT "job_request_applications_jobRequestId_fkey" FOREIGN KEY ("jobRequestId") REFERENCES "job_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_request_applications" ADD CONSTRAINT "job_request_applications_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
