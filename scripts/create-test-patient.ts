/**
 * Script pour créer un patient test avec analyse BdF
 * Usage: npx tsx scripts/create-test-patient.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Création du patient TEST TEST...\n");

  // Vérifier si le patient existe déjà
  const existing = await prisma.patient.findFirst({
    where: {
      nom: "TEST",
      prenom: "TEST",
    },
  });

  if (existing) {
    console.log("⚠️ Patient TEST TEST existe déjà, suppression...");
    await prisma.patient.delete({ where: { id: existing.id } });
  }

  // Générer un numéro patient unique
  const allPatients = await prisma.patient.findMany({
    select: { numeroPatient: true },
  });
  const maxNum = allPatients
    .map((p) => parseInt(p.numeroPatient.replace("PAT-", "")) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  const numeroPatient = `PAT-${String(maxNum + 1).padStart(3, "0")}`;

  // Valeurs biologiques pour tester les index
  const bdfInputs = {
    // NFS de base
    GR: 4.2,        // T/L (10¹²/L) - pour Index Génital
    GB: 7.5,        // G/L (10⁹/L) - pour Index Génital
    PLAQUETTES: 280, // G/L - pour IMP
    HB: 12.5,       // g/dL

    // Formule leucocytaire (%)
    NEUT: 55,       // Neutrophiles - pour Index Génito-Thyroïdien
    LYMPH: 32,      // Lymphocytes - pour Index Génito-Thyroïdien
    MONO: 6,        // Monocytes - pour Index Adaptation
    EOS: 4,         // Éosinophiles - pour Index Adaptation
    BASO: 0.5,      // Basophiles - pour Index Histamine

    // Enzymes (pour Index Thyroïdien)
    LDH: 180,       // U/L
    CPK: 90,        // U/L

    // Thyroïde
    TSH: 2.1,       // mUI/L

    // Bilan hépatique (pour évaluer drainage)
    ALAT: 35,       // U/L
    ASAT: 30,       // U/L
    GGT: 45,        // U/L

    // Ions (pour Index Minéralocorticoïde)
    NA: 140,        // mmol/L
    K: 4.2,         // mmol/L

    // Calcium/Phosphore (pour Index PTH)
    CA: 2.35,       // mmol/L (= 94 mg/L)
    P: 1.1,         // mmol/L

    // Bilan lipidique/glucidique
    TG: 1.2,        // g/L
    GLY: 0.95,      // g/L

    // Marqueurs osseux (optionnels)
    PAOI: 65,       // U/L - Phosphatases alcalines osseuses
    OSTEO: 12,      // ng/mL - Ostéocalcine
  };

  // Calculs attendus
  const expectedIndexes = {
    idx_genital: 4.2 / 7.5, // = 0.56 (< 0.6 → dominance œstrogénique)
    idx_genito_thyroidien: 55 / 32, // = 1.72 (normal)
    idx_adaptation: 4 / (6 + 0.1), // = 0.66 (normal)
    idx_thyroidien: 180 / 90, // = 2.0 (limite basse)
    idx_imp: 280 / (60 * 4.2), // = 1.11 (normal-élevé)
    idx_mineralo: 140 / 4.2, // = 33.3 (normal)
  };

  console.log("📊 Valeurs biologiques:");
  console.log(JSON.stringify(bdfInputs, null, 2));

  console.log("\n📈 Index attendus:");
  Object.entries(expectedIndexes).forEach(([key, value]) => {
    console.log(`  ${key}: ${value.toFixed(3)}`);
  });

  // Créer le patient avec analyse BdF
  const patient = await prisma.patient.create({
    data: {
      numeroPatient,
      nom: "TEST",
      prenom: "TEST",
      dateNaissance: new Date("1990-01-01"),
      sexe: "F",
      telephone: "0600000000",
      email: "test@test.com",
      notes: "Patient de test pour vérifier les index BdF (IML, IMP, Starter)",
      allergies: "Aucune",
      atcdMedicaux: "RAS",
      atcdChirurgicaux: "RAS",
      traitements: "Aucun",
      consentementRGPD: true,
      dateConsentement: new Date(),
      // Contexte pour ordonnance
      pathologiesAssociees: ["Test endobiogénie"],
      symptomesActuels: ["Fatigue", "Stress", "Troubles du sommeil"],
      autresBilans: {
        vitD: 28,
        ferritine: 45,
      },
      // Créer l'analyse BdF en même temps
      bdfAnalyses: {
        create: {
          date: new Date(),
          inputs: bdfInputs,
          indexes: [], // Sera calculé par l'interface
          summary: "Patient test pour vérification des index endobiogéniques (IML, IMP, Starter, Index Génital corrigé)",
          axes: ["gonadotrope", "sna", "thyreotrope"],
          ragText: "Test des corrections index - Session Claude Code",
        },
      },
    },
    include: {
      bdfAnalyses: true,
    },
  });

  console.log("\n✅ Patient créé avec succès!");
  console.log(`   ID: ${patient.id}`);
  console.log(`   Numéro: ${patient.numeroPatient}`);
  console.log(`   Nom: ${patient.nom} ${patient.prenom}`);
  console.log(`   Sexe: ${patient.sexe}`);
  console.log(`   Analyses BdF: ${patient.bdfAnalyses.length}`);

  console.log("\n📋 Pour tester:");
  console.log(`   1. Ouvrir l'application`);
  console.log(`   2. Aller sur le patient "${patient.prenom} ${patient.nom}"`);
  console.log(`   3. Aller dans l'onglet "Analyses" ou "BdF"`);
  console.log(`   4. Vérifier que les index suivants sont affichés:`);
  console.log(`      - Index Génital = ${expectedIndexes.idx_genital.toFixed(2)} (formule GR/GB)`);
  console.log(`      - Index Starter = IML/IMP`);
  console.log(`      - IML, IMP visibles dans le panel SNA`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erreur:", e);
  prisma.$disconnect();
  process.exit(1);
});
