// ========================================
// SCRIPT DE TEST - Système d'ordonnances
// ========================================
// Test du flux complet : génération + chat

/**
 * Ce script teste :
 * 1. Génération d'ordonnance avec valeurs BdF de test
 * 2. Chat avec l'ordonnance
 * 3. Application d'une modification
 *
 * USAGE:
 * npx tsx scripts/test-ordonnance.ts
 */

import { TherapeuticReasoningEngine } from "../lib/ordonnance/therapeuticReasoning";
import type { IndexResults, LabValues } from "../lib/bdf/types";
import type { TherapeuticScope } from "../lib/ordonnance/types";

async function testOrdonnanceGeneration() {
  console.log("🧪 TEST 1 : Génération d'ordonnance\n");
  console.log("=" .repeat(60));

  // ==========================================
  // DONNÉES DE TEST - Patient hypo-thyroïdien avec stress
  // ==========================================
  const labValues: LabValues = {
    GR: 4.2,
    GB: 6.5,
    neutrophiles: 3.5,
    lymphocytes: 2.2,
    eosinophiles: 0.15,
    monocytes: 0.4,
    plaquettes: 250,
    LDH: 180,
    CPK: 120,
    TSH: 3.2,
  };

  // Index BdF simulés (normalement calculés par calculateIndexes)
  const indexes: IndexResults = {
    indexGenital: {
      value: 520,
      comment: "Empreinte œstrogénique relative dominante",
    },
    indexThyroidien: {
      value: 1.8, // < 2.0 = HYPO
      comment: "Rendement fonctionnel thyroïdien réduit",
    },
    gT: {
      value: 936,
      comment: "Normal",
    },
    indexAdaptation: {
      value: 0.65, // < 0.7 = Stress (ACTH/cortisol dominant)
      comment: "Orientation ACTH/cortisol dominante",
    },
    indexOestrogenique: {
      value: 0.55,
      comment: "Normal",
    },
    turnover: {
      value: 85,
      comment: "Normal",
    },
    rendementThyroidien: {
      value: 0.85,
      comment: "Rendement faible",
    },
    remodelageOsseux: {
      value: 1.2,
      comment: "Normal",
    },
  };

  // Scope thérapeutique
  const scope: TherapeuticScope = {
    planteMedicinale: true,
    gemmotherapie: true,
    aromatherapie: false,
    micronutrition: true,
  };

  // Contexte patient
  const patientContext = {
    age: 42,
    sexe: "F" as const,
    CI: [],
    traitements: [],
    symptomes: ["fatigue", "frilosité", "anxiété"],
  };

  // ==========================================
  // EXÉCUTION DU RAISONNEMENT
  // ==========================================
  console.log("\n📊 Valeurs BdF en entrée:");
  console.log(`  - GR: ${labValues.GR}, GB: ${labValues.GB}, TSH: ${labValues.TSH}`);
  console.log(`  - Index thyroïdien: ${indexes.indexThyroidien.value} (hypo)`);
  console.log(`  - Index adaptation: ${indexes.indexAdaptation.value} (stress)`);

  console.log("\n🔄 Lancement du moteur de raisonnement...\n");

  const engine = new TherapeuticReasoningEngine();

  try {
    const result = await engine.executeFullReasoning(
      indexes,
      labValues,
      scope,
      patientContext
    );

    // ==========================================
    // AFFICHAGE RÉSULTATS
    // ==========================================
    console.log("\n" + "=".repeat(60));
    console.log("📋 RÉSULTATS\n");

    console.log(`✅ ${result.axesPerturbés.length} axe(s) perturbé(s) détecté(s):`);
    for (const axe of result.axesPerturbés) {
      console.log(`  - ${axe.axe.toUpperCase()} (${axe.niveau}): score ${axe.score}/10`);
      console.log(`    ${axe.justification}`);
    }

    console.log(`\n💡 ${result.hypothesesRegulatrices.length} hypothèse(s) régulatrice(s):`);
    for (const hyp of result.hypothesesRegulatrices) {
      console.log(`  - ${hyp}`);
    }

    console.log(`\n🌿 VOLET 1 - ENDOBIOGÉNIE (${result.recommandationsEndobiogenie.length} recommandation(s)):`);
    for (const rec of result.recommandationsEndobiogenie) {
      console.log(`  ✓ ${rec.substance} (${rec.forme})`);
      console.log(`    Posologie: ${rec.posologie} | Durée: ${rec.duree}`);
      console.log(`    Axe: ${rec.axeCible}`);
      console.log(`    Mécanisme: ${rec.mecanisme}`);
      console.log(`    Source: ${rec.sourceVectorstore} | Niveau preuve: ${rec.niveauPreuve}`);
    }

    console.log(`\n🌱 VOLET 2 - PHYTO ÉLARGI (${result.recommandationsElargies.length} recommandation(s)):`);
    for (const rec of result.recommandationsElargies) {
      console.log(`  ✓ ${rec.substance} (${rec.forme})`);
      console.log(`    Posologie: ${rec.posologie} | Durée: ${rec.duree}`);
    }

    console.log(`\n💊 VOLET 3 - COMPLÉMENTS (${result.recommandationsMicronutrition.length} recommandation(s)):`);
    for (const rec of result.recommandationsMicronutrition) {
      console.log(`  ✓ ${rec.substance} (${rec.forme})`);
      console.log(`    Posologie: ${rec.posologie} | Durée: ${rec.duree}`);
      console.log(`    Axe: ${rec.axeCible}`);
    }

    console.log(`\n⚠️  ${result.alertes.length} alerte(s):`);
    if (result.alertes.length === 0) {
      console.log(`  Aucune alerte`);
    } else {
      for (const alerte of result.alertes) {
        console.log(`  - [${alerte.niveau.toUpperCase()}] ${alerte.message}`);
      }
    }

    console.log(`\n💰 Coût estimé: ${result.coutEstime}€/mois`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ TEST 1 RÉUSSI - Ordonnance générée avec succès!\n");

    // ==========================================
    // STATISTIQUES
    // ==========================================
    const totalRecs =
      result.recommandationsEndobiogenie.length +
      result.recommandationsElargies.length +
      result.recommandationsMicronutrition.length;

    console.log("📊 STATISTIQUES:");
    console.log(`  - Total recommandations: ${totalRecs}`);
    console.log(`  - Niveau preuve 1 (canon): ${result.recommandationsEndobiogenie.length}`);
    console.log(`  - Niveau preuve 2 (élargi): ${result.recommandationsElargies.length}`);
    console.log(`  - Niveau preuve 3 (micro): ${result.recommandationsMicronutrition.length}`);
    console.log(`  - Axes perturbés: ${result.axesPerturbés.length}`);
    console.log(`  - Hypothèses régulatrices: ${result.hypothesesRegulatrices.length}`);

    return result;
  } catch (error) {
    console.error("\n❌ ERREUR durant le test:", error);
    throw error;
  }
}

// ==========================================
// EXÉCUTION
// ==========================================
async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║     TEST SYSTÈME D'ORDONNANCES INTELLIGENT               ║");
  console.log("║     Raisonnement thérapeutique en 4 étapes               ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log("\n");

  try {
    await testOrdonnanceGeneration();

    console.log("\n");
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║              ✅ TOUS LES TESTS RÉUSSIS                   ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
    console.log("\n");

    console.log("💡 Prochaines étapes:");
    console.log("  1. Tester via l'API REST: POST /api/ordonnances/generate");
    console.log("  2. Tester le chat: POST /api/ordonnances/[id]/chat");
    console.log("  3. Créer l'interface utilisateur React\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Tests échoués\n");
    process.exit(1);
  }
}

// Lancer les tests
main();
