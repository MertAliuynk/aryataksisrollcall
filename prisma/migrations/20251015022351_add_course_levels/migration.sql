/*
  Warnings:

  - You are about to drop the column `attendanceDays` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `student_courses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,courseLevelId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,courseLevelId]` on the `student_courses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseLevelId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseLevelId` to the `student_courses` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Create course_levels table
CREATE TABLE "course_levels" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "attendanceDays" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_levels_pkey" PRIMARY KEY ("id")
);

-- Step 2: Insert default course levels for existing courses
INSERT INTO "course_levels" ("id", "courseId", "level", "attendanceDays")
SELECT 
    CONCAT(c.id, '-temel') as "id",
    c.id as "courseId",
    'temel' as "level",
    COALESCE(c."attendanceDays", 'monday,wednesday,friday') as "attendanceDays"
FROM "courses" c;

-- Step 3: Add foreign key constraint for course_levels
ALTER TABLE "course_levels" ADD CONSTRAINT "course_levels_courseId_fkey1" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Add columns to attendances table with defaults
ALTER TABLE "attendances" 
ADD COLUMN "courseLevelId" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 5: Update existing attendance records with default course level
UPDATE "attendances" SET 
    "courseLevelId" = CONCAT("courseId", '-temel'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "courseLevelId" IS NULL;

-- Step 6: Make courseLevelId NOT NULL after update
ALTER TABLE "attendances" ALTER COLUMN "courseLevelId" SET NOT NULL;
ALTER TABLE "attendances" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Step 7: Add columns to student_courses table
ALTER TABLE "student_courses" 
ADD COLUMN "courseLevelId" TEXT,
ADD COLUMN "enrolledAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 8: Update existing student course records
UPDATE "student_courses" SET 
    "courseLevelId" = CONCAT("courseId", '-temel'),
    "enrolledAt" = CURRENT_TIMESTAMP
WHERE "courseLevelId" IS NULL;

-- Step 9: Make courseLevelId NOT NULL and drop createdAt
ALTER TABLE "student_courses" ALTER COLUMN "courseLevelId" SET NOT NULL;
ALTER TABLE "student_courses" DROP COLUMN "createdAt";

-- Step 10: Drop old indexes
DROP INDEX IF EXISTS "attendances_studentId_courseId_date_key";
DROP INDEX IF EXISTS "student_courses_studentId_courseId_key";

-- Step 11: Add foreign key constraints
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_courseLevelId_fkey1" FOREIGN KEY ("courseLevelId") REFERENCES "course_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_courseLevelId_fkey1" FOREIGN KEY ("courseLevelId") REFERENCES "course_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 12: Create new unique indexes
CREATE UNIQUE INDEX "attendances_studentId_courseLevelId_date_key" ON "attendances"("studentId", "courseLevelId", "date");
CREATE UNIQUE INDEX "student_courses_studentId_courseLevelId_key" ON "student_courses"("studentId", "courseLevelId");

-- Step 13: Remove attendanceDays column from courses and add description
ALTER TABLE "courses" DROP COLUMN "attendanceDays";
ALTER TABLE "courses" ADD COLUMN "description" TEXT;

-- AddForeignKey
ALTER TABLE "course_levels" ADD CONSTRAINT "course_levels_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_courseLevelId_fkey" FOREIGN KEY ("courseLevelId") REFERENCES "course_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_courseLevelId_fkey" FOREIGN KEY ("courseLevelId") REFERENCES "course_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
