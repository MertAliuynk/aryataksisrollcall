/*
  Warnings:

  - You are about to drop the column `isPresent` on the `attendances` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "isPresent",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';
