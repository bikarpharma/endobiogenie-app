-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BdfIndexType" AS ENUM ('DIRECT', 'INDIRECT', 'COMPOSITE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Nouvelle conversation',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numeroPatient" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "sexe" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "allergies" TEXT,
    "atcdMedicaux" TEXT,
    "atcdChirurgicaux" TEXT,
    "traitements" TEXT,
    "traitementActuel" TEXT,
    "contreindicationsMajeures" JSONB,
    "tags" JSONB,
    "pathologiesAssociees" JSONB,
    "symptomesActuels" JSONB,
    "autresBilans" JSONB,
    "interrogatoire" JSONB,
    "consentementRGPD" BOOLEAN NOT NULL DEFAULT false,
    "dateConsentement" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anthropometries" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poids" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "imc" DOUBLE PRECISION,
    "paSys" INTEGER,
    "paDia" INTEGER,
    "pouls" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anthropometries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bdf_analyses" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputs" JSONB NOT NULL,
    "indexes" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "axes" JSONB NOT NULL,
    "ragText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bdf_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "dateConsultation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "motifConsultation" TEXT,
    "inputs" JSONB,
    "indexes" JSONB,
    "summary" TEXT,
    "axes" JSONB,
    "ragText" TEXT,
    "commentaire" TEXT,
    "prescriptions" TEXT,
    "bdfAnalysisId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordonnances" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "bdfAnalysisId" TEXT,
    "voletEndobiogenique" JSONB NOT NULL DEFAULT '[]',
    "voletPhytoElargi" JSONB NOT NULL DEFAULT '[]',
    "voletComplements" JSONB NOT NULL DEFAULT '[]',
    "scope" JSONB,
    "syntheseClinique" TEXT NOT NULL DEFAULT '',
    "conseilsAssocies" JSONB NOT NULL DEFAULT '[]',
    "surveillanceBiologique" JSONB NOT NULL DEFAULT '[]',
    "dateRevaluation" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'brouillon',
    "chatMessagesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordonnances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordonnance_chats" (
    "id" TEXT NOT NULL,
    "ordonnanceId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordonnance_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "axe_interpretations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "axe" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "mecanismes" JSONB NOT NULL,
    "prudences" JSONB NOT NULL,
    "modulateurs" JSONB NOT NULL,
    "resumeClinique" TEXT NOT NULL,
    "confiance" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "axe_interpretations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synthese_globale" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "nombreAxesAnalyses" INTEGER NOT NULL DEFAULT 0,
    "inclusBiologieFonction" BOOLEAN NOT NULL DEFAULT false,
    "confiance" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "modelUsed" TEXT,
    "promptVersion" TEXT,
    "inputHash" TEXT,
    "executionTimeMs" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "supersededById" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synthese_globale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biomarkers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "referenceMin" DECIMAL(10,3),
    "referenceMax" DECIMAL(10,3),
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biomarkers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bdf_panels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bdf_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bdf_panel_biomarkers" (
    "panelId" TEXT NOT NULL,
    "biomarkerId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "bdf_panel_biomarkers_pkey" PRIMARY KEY ("panelId","biomarkerId")
);

-- CreateTable
CREATE TABLE "bdf_index_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BdfIndexType" NOT NULL,
    "biomarkers" JSONB NOT NULL,
    "requiresIndexes" JSONB,
    "formula" JSONB,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bdf_index_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bdf_results" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "biomarkerCode" TEXT NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "unit" TEXT,
    "referenceMin" DECIMAL(10,3),
    "referenceMax" DECIMAL(10,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bdf_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bdf_index_results" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "indexCode" TEXT NOT NULL,
    "value" DECIMAL(10,3),
    "category" TEXT,
    "subCategory" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bdf_index_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "chats_userId_createdAt_idx" ON "chats"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_chatId_createdAt_idx" ON "messages"("chatId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "patients_numeroPatient_key" ON "patients"("numeroPatient");

-- CreateIndex
CREATE INDEX "patients_userId_nom_prenom_idx" ON "patients"("userId", "nom", "prenom");

-- CreateIndex
CREATE INDEX "patients_numeroPatient_idx" ON "patients"("numeroPatient");

-- CreateIndex
CREATE INDEX "anthropometries_patientId_date_idx" ON "anthropometries"("patientId", "date");

-- CreateIndex
CREATE INDEX "bdf_analyses_patientId_date_idx" ON "bdf_analyses"("patientId", "date");

-- CreateIndex
CREATE INDEX "consultations_patientId_dateConsultation_idx" ON "consultations"("patientId", "dateConsultation");

-- CreateIndex
CREATE INDEX "ordonnances_patientId_createdAt_idx" ON "ordonnances"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "ordonnance_chats_ordonnanceId_createdAt_idx" ON "ordonnance_chats"("ordonnanceId", "createdAt");

-- CreateIndex
CREATE INDEX "ordonnance_chats_patientId_idx" ON "ordonnance_chats"("patientId");

-- CreateIndex
CREATE INDEX "axe_interpretations_patientId_idx" ON "axe_interpretations"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "axe_interpretations_patientId_axe_key" ON "axe_interpretations"("patientId", "axe");

-- CreateIndex
CREATE INDEX "synthese_globale_patientId_createdAt_idx" ON "synthese_globale"("patientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "biomarkers_code_key" ON "biomarkers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bdf_panels_code_key" ON "bdf_panels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bdf_index_definitions_code_key" ON "bdf_index_definitions"("code");

-- CreateIndex
CREATE INDEX "bdf_results_consultationId_idx" ON "bdf_results"("consultationId");

-- CreateIndex
CREATE INDEX "bdf_results_biomarkerCode_idx" ON "bdf_results"("biomarkerCode");

-- CreateIndex
CREATE UNIQUE INDEX "bdf_results_consultationId_biomarkerCode_key" ON "bdf_results"("consultationId", "biomarkerCode");

-- CreateIndex
CREATE INDEX "bdf_index_results_consultationId_idx" ON "bdf_index_results"("consultationId");

-- CreateIndex
CREATE INDEX "bdf_index_results_indexCode_idx" ON "bdf_index_results"("indexCode");

-- CreateIndex
CREATE UNIQUE INDEX "bdf_index_results_consultationId_indexCode_key" ON "bdf_index_results"("consultationId", "indexCode");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometries" ADD CONSTRAINT "anthropometries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdf_analyses" ADD CONSTRAINT "bdf_analyses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnance_chats" ADD CONSTRAINT "ordonnance_chats_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "ordonnances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnance_chats" ADD CONSTRAINT "ordonnance_chats_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "axe_interpretations" ADD CONSTRAINT "axe_interpretations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synthese_globale" ADD CONSTRAINT "synthese_globale_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synthese_globale" ADD CONSTRAINT "synthese_globale_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "synthese_globale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdf_panel_biomarkers" ADD CONSTRAINT "bdf_panel_biomarkers_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "bdf_panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdf_panel_biomarkers" ADD CONSTRAINT "bdf_panel_biomarkers_biomarkerId_fkey" FOREIGN KEY ("biomarkerId") REFERENCES "biomarkers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdf_results" ADD CONSTRAINT "bdf_results_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdf_index_results" ADD CONSTRAINT "bdf_index_results_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
