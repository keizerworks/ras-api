-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('SECTIONAL', 'MULTI_SECTIONAL', 'FULL_LENGTH');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "subjects" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "testType" "TestType";
