/*
  Warnings:

  - You are about to drop the column `parentName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "parentName",
DROP COLUMN "parentPhone",
DROP COLUMN "phone",
ADD COLUMN     "fatherFirstName" TEXT,
ADD COLUMN     "fatherLastName" TEXT,
ADD COLUMN     "fatherPhone" TEXT,
ADD COLUMN     "motherFirstName" TEXT,
ADD COLUMN     "motherLastName" TEXT,
ADD COLUMN     "motherPhone" TEXT;
