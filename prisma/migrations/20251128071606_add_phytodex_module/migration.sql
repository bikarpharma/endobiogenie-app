-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('TRADITION_ONLY', 'PRECLINICAL_DATA', 'SOME_CLINICAL_DATA');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('BOOK', 'THESIS', 'ARTICLE', 'FIELD_INTERVIEW', 'REPORT');

-- CreateTable
CREATE TABLE "phytodex_plants" (
    "id" SERIAL NOT NULL,
    "latinName" TEXT NOT NULL,
    "family" TEXT,
    "mainVernacularName" TEXT,
    "otherVernacularNames" TEXT,
    "region" TEXT,
    "mainActions" TEXT,
    "mainIndications" TEXT,
    "usualForms" TEXT,
    "officinalAvailability" TEXT,
    "safetyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phytodex_plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phytodex_traditional_uses" (
    "id" SERIAL NOT NULL,
    "plantId" INTEGER NOT NULL,
    "indicationCategory" TEXT,
    "indicationDetail" TEXT NOT NULL,
    "partUsed" TEXT,
    "preparation" TEXT,
    "dosageNotes" TEXT,
    "sourceId" INTEGER NOT NULL,
    "evidenceLevel" "EvidenceLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phytodex_traditional_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phytodex_sources" (
    "id" SERIAL NOT NULL,
    "type" "SourceType" NOT NULL,
    "citation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phytodex_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phytodex_plants_latinName_idx" ON "phytodex_plants"("latinName");

-- CreateIndex
CREATE INDEX "phytodex_plants_mainVernacularName_idx" ON "phytodex_plants"("mainVernacularName");

-- CreateIndex
CREATE INDEX "phytodex_plants_region_idx" ON "phytodex_plants"("region");

-- CreateIndex
CREATE INDEX "phytodex_traditional_uses_plantId_idx" ON "phytodex_traditional_uses"("plantId");

-- CreateIndex
CREATE INDEX "phytodex_traditional_uses_indicationCategory_idx" ON "phytodex_traditional_uses"("indicationCategory");

-- AddForeignKey
ALTER TABLE "phytodex_traditional_uses" ADD CONSTRAINT "phytodex_traditional_uses_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "phytodex_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phytodex_traditional_uses" ADD CONSTRAINT "phytodex_traditional_uses_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "phytodex_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
