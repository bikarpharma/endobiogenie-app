-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "allergiesNotes" TEXT,
ADD COLUMN     "allergiesStructured" JSONB;
