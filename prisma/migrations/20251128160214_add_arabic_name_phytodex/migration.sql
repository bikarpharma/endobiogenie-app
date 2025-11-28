-- AlterTable
ALTER TABLE "phytodex_plants" ADD COLUMN     "arabicName" TEXT,
ADD COLUMN     "partUsed" TEXT;

-- CreateIndex
CREATE INDEX "phytodex_plants_arabicName_idx" ON "phytodex_plants"("arabicName");
