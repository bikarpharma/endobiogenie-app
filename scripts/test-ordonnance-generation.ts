/**
 * Test de génération d'ordonnance avec le nouveau moteur thérapeutique
 * Usage: npx tsx scripts/test-ordonnance-generation.ts
 */

import { PrismaClient } from "@prisma/client";
import { TherapeuticReasoningEngine } from "../lib/ordonnance/therapeuticReasoning";
import { calculateAllIndexes } from "../lib/bdf/calculateIndexes";

const prisma = new PrismaClient();

async function main() {
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("🧪 TEST DU MOTEUR DE RAISONNEMENT THÉRAPEUTIQUE ENDOBIOGÉNIQUE");
  console.log("═══════════════════════════════════════════════════════════════════\n");

  // Récupérer le patient TEST TEST
  const patient = await prisma.patient.findFirst({
    where: { nom: "TEST", prenom: "TEST" },
    include: {
      bdfAnalyses: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  if (!patient) {
    console.error("❌ Patient TEST TEST non trouvé!");
    await prisma.$disconnect();
    return;
  }

  if (patient.bdfAnalyses.length === 0) {
    console.error("❌ Aucune analyse BdF pour ce patient!");
    await prisma.$disconnect();
    return;
  }

  console.log(`📋 Patient: ${patient.prenom} ${patient.nom}`);
  console.log(`📅 Date naissance: ${patient.dateNaissance?.toLocaleDateString("fr-FR")}`);
  console.log(`🚻 Sexe: ${patient.sexe}`);

  const bdfAnalysis = patient.bdfAnalyses[0];
  const bdfInputs = bdfAnalysis.inputs as Record<string, number>;

  console.log("\n📊 VALEURS BIOLOGIQUES (INPUTS):");
  console.log("─────────────────────────────────");
  Object.entries(bdfInputs).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(12)}: ${value}`);
  });

  // ==========================================
  // ÉTAPE 1: CALCULER LES INDEX
  // ==========================================
  console.log("\n📈 CALCUL DES INDEX BdF:");
  console.log("─────────────────────────────────");

  const indexResults = calculateAllIndexes(bdfInputs);

  // Afficher les index calculés
  const importantIndexes = [
    "idx_genital",
    "idx_genito_thyroidien",
    "idx_adaptation",
    "idx_thyroidien",
    "idx_mobilisation_plaquettes",
    "idx_mobilisation_leucocytes",
    "idx_starter",
    "idx_genital_corrige",
    "idx_histamine",
    "idx_mineralo",
  ];

  for (const key of importantIndexes) {
    const idx = indexResults.indexes[key];
    if (idx && idx.value !== null) {
      console.log(`  ${key.padEnd(30)}: ${idx.value.toFixed(3).padStart(8)} [${idx.status}]`);
    } else if (idx) {
      console.log(`  ${key.padEnd(30)}: N/A (données manquantes)`);
    }
  }

  // ==========================================
  // ÉTAPE 2: EXÉCUTER LE MOTEUR DE RAISONNEMENT
  // ==========================================
  console.log("\n🧠 EXÉCUTION DU MOTEUR DE RAISONNEMENT:");
  console.log("═══════════════════════════════════════════════════════════════════");

  const engine = new TherapeuticReasoningEngine();

  const patientContext = {
    age: patient.dateNaissance
      ? Math.floor((Date.now() - patient.dateNaissance.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 35,
    sexe: (patient.sexe === "H" ? "M" : "F") as "M" | "F",
    CI: patient.allergies ? [patient.allergies] : [],
    traitements: patient.traitements ? [patient.traitements] : [],
    symptomes: (patient.symptomesActuels as string[]) || [],
    pathologies: (patient.pathologiesAssociees as string[]) || [],
    autresBilans: (patient.autresBilans as Record<string, number>) || {},
  };

  console.log("\n👤 Contexte patient:");
  console.log(`  Âge: ${patientContext.age} ans`);
  console.log(`  Sexe: ${patientContext.sexe}`);
  console.log(`  CI: ${patientContext.CI.length > 0 ? patientContext.CI.join(", ") : "Aucune"}`);
  console.log(`  Symptômes: ${patientContext.symptomes.length > 0 ? patientContext.symptomes.join(", ") : "Non renseignés"}`);

  const scope = {
    planteMedicinale: true,
    gemmotherapie: true,
    aromatherapie: false,
    micronutrition: true,
  };

  try {
    const raisonnement = await engine.executeFullReasoning(
      indexResults.indexes as any,
      bdfInputs as any,
      scope,
      patientContext
    );

    // ==========================================
    // RÉSULTATS
    // ==========================================
    console.log("\n═══════════════════════════════════════════════════════════════════");
    console.log("📋 RÉSULTATS DU RAISONNEMENT THÉRAPEUTIQUE");
    console.log("═══════════════════════════════════════════════════════════════════");

    // Axes perturbés
    console.log("\n🎯 AXES PERTURBÉS DÉTECTÉS:");
    console.log("─────────────────────────────────");
    if (raisonnement.axesPerturbés.length === 0) {
      console.log("  Aucun axe significativement perturbé");
    } else {
      raisonnement.axesPerturbés.forEach((axe, i) => {
        console.log(`  ${i + 1}. ${axe.axe.toUpperCase()} (${axe.niveau}) - Score: ${axe.score}/10`);
        console.log(`     └─ ${axe.justification}`);
      });
    }

    // Alertes
    if (raisonnement.alertes.length > 0) {
      console.log("\n⚠️  ALERTES:");
      console.log("─────────────────────────────────");
      raisonnement.alertes.forEach((alerte) => {
        const icon = alerte.niveau === "error" ? "🔴" : alerte.niveau === "warning" ? "🟠" : "🔵";
        console.log(`  ${icon} [${alerte.type.toUpperCase()}] ${alerte.message}`);
        if (alerte.recommandation) {
          console.log(`     → ${alerte.recommandation}`);
        }
      });
    }

    // Hypothèses régulatrices
    if (raisonnement.hypothesesRegulatrices.length > 0) {
      console.log("\n💡 HYPOTHÈSES RÉGULATRICES:");
      console.log("─────────────────────────────────");
      raisonnement.hypothesesRegulatrices.forEach((h, i) => {
        console.log(`  ${i + 1}. ${h}`);
      });
    }

    // Recommandations Endobiogénie
    console.log("\n💊 RECOMMANDATIONS ENDOBIOGÉNIE (Volet 1):");
    console.log("─────────────────────────────────");
    if (raisonnement.recommandationsEndobiogenie.length === 0) {
      console.log("  Aucune recommandation générée");
    } else {
      raisonnement.recommandationsEndobiogenie.forEach((rec, i) => {
        const nomFr = rec.nomFrancais ? ` (${rec.nomFrancais})` : "";
        console.log(`  ${i + 1}. ${rec.substance}${nomFr}`);
        console.log(`     Forme: ${rec.forme} | Posologie: ${rec.posologie} | Durée: ${rec.duree}`);
        console.log(`     Axe cible: ${rec.axeCible}`);
        console.log(`     Mécanisme: ${rec.mecanisme}`);
        if (rec.CI.length > 0) {
          console.log(`     ⚠️ CI: ${rec.CI.join(", ")}`);
        }
        console.log("");
      });
    }

    // Recommandations élargies
    if (raisonnement.recommandationsElargies.length > 0) {
      console.log("\n🌿 RECOMMANDATIONS ÉLARGIES (Volet 2):");
      console.log("─────────────────────────────────");
      raisonnement.recommandationsElargies.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.substance} - ${rec.forme} - ${rec.posologie}`);
      });
    }

    // Micronutrition
    if (raisonnement.recommandationsMicronutrition.length > 0) {
      console.log("\n🥗 MICRONUTRITION (Volet 3):");
      console.log("─────────────────────────────────");
      raisonnement.recommandationsMicronutrition.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.substance} - ${rec.posologie}`);
        console.log(`     └─ ${rec.mecanisme}`);
      });
    }

    // Raisonnement détaillé
    console.log("\n📝 RAISONNEMENT DÉTAILLÉ:");
    console.log("─────────────────────────────────");
    console.log(raisonnement.raisonnementDetaille);

    // Coût estimé
    console.log("\n💰 COÛT ESTIMÉ: ~" + raisonnement.coutEstime + " €/mois");

    console.log("\n═══════════════════════════════════════════════════════════════════");
    console.log("✅ TEST TERMINÉ AVEC SUCCÈS");
    console.log("═══════════════════════════════════════════════════════════════════");

  } catch (error: any) {
    console.error("\n❌ ERREUR lors du raisonnement:", error.message);
    console.error(error.stack);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
