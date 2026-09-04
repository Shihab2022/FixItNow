-- Add imageUrl columns for image upload (Cloudinary) support
ALTER TABLE "users" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "technician" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "services" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "categories" ADD COLUMN "imageUrl" TEXT;