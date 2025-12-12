/**
 * Script de test - Smart Lab Import
 * ==================================
 * Teste l'extraction et la normalisation sur les PDF d'exemple.
 *
 * Usage: npx tsx scripts/test-lab-import.ts
 */

import * as fs from "fs";
import * as path from "path";
import { findBiomarkerCode } from "../lib/bdf/labImport/labSynonyms.config";
import { normalizeLabValues, toBdfInputs } from "../lib/bdf/labImport/labNormalizer";
import type { RawLabValue } from "../lib/bdf/labImport/labExtractor";

// Couleurs pour la console
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

/**
 * Simule les valeurs extraites du PDF pour tester la normalisation
 * (basé sur le contenu réel des PDF tunisiens)
 */
function getSimulatedPdfData(): RawLabValue[] {
  // Données extraites manuellement du PDF "2105100011_Monsieur BEN AYED AMIN (1).pdf"
  return [
    { originalName: "HÉMATIES", value: 4.91, unit: "10^6/µL", confidence: 0.95 },
    { originalName: "HÉMATOCRITE", value: 41.9, unit: "%", confidence: 0.95 },
    { originalName: "HÉMOGLOBINE", value: 14.0, unit: "g/dL", confidence: 0.95 },
    { originalName: "LEUCOCYTES", value: 9100, unit: "/mm3", confidence: 0.95 },
    { originalName: "Polynucléaires Neutrophiles", value: 72, unit: "%", confidence: 0.90 },
    { originalName: "Polynucléaires Eosinophiles", value: 1, unit: "%", confidence: 0.90 },
    { originalName: "Polynucléaires Basophiles", value: 0, unit: "%", confidence: 0.90 },
    { originalName: "Lymphocytes", value: 20, unit: "%", confidence: 0.90 },
    { originalName: "Monocytes", value: 7, unit: "%", confidence: 0.90 },
    { originalName: "NUMERATION DES PLAQUETTES", value: 153, unit: "10^3/mm3", confidence: 0.95 },
    { originalName: "PROTEINE C REACTIVE", value: 2.0, unit: "mg/l", confidence: 0.95 },
    { originalName: "VITESSE DE SEDIMENTATION", value: 10, unit: "mm", confidence: 0.90 },
    // Données du second PDF (plus complet)
    { originalName: "GLYCEMIE à jeun", value: 1.03, unit: "g/L", confidence: 0.95 },
    { originalName: "UREE", value: 0.42, unit: "g/L", confidence: 0.95 },
    { originalName: "CREATININE", value: 93, unit: "µmol/L", confidence: 0.95 },
    { originalName: "SODIUM", value: 139.9, unit: "mmol/L", confidence: 0.95 },
    { originalName: "POTASSIUM", value: 4.17, unit: "mmol/L", confidence: 0.95 },
    { originalName: "CHLORURES", value: 105, unit: "mmol/L", confidence: 0.95 },
    { originalName: "TRIGLYCERIDES", value: 0.6, unit: "g/L", confidence: 0.95 },
    { originalName: "CHOLESTEROL TOTAL", value: 1.74, unit: "g/L", confidence: 0.95 },
    { originalName: "BILIRUBINE TOTALE", value: 6.10, unit: "µmol/L", confidence: 0.95 },
    { originalName: "PHOSPHATASES ALCALINES", value: 89, unit: "UI/L", confidence: 0.95 },
    { originalName: "ASAT (SGOT)", value: 23, unit: "UI/L", confidence: 0.95 },
    { originalName: "ALAT (SGPT)", value: 25, unit: "UI/L", confidence: 0.95 },
    { originalName: "GGT", value: 26, unit: "UI/L", confidence: 0.95 },
    { originalName: "THYREOSTIMULINE (TSH)", value: 3.18, unit: "µUI/mL", confidence: 0.95 },
  ];
}

async function main() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.blue}           SMART LAB IMPORT - TEST NORMALISATION${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`
  );

  // Utiliser des données simulées (comme si GPT-4 Vision les avait extraites)
  const rawValues = getSimulatedPdfData();

  console.log(`${colors.cyan}📋 Données simulées (comme extraites du PDF):${colors.reset}`);
  console.log(`   ${rawValues.length} valeurs biologiques\n`);

  // Tester la normalisation
  const result = normalizeLabValues(rawValues);

  // Afficher les statistiques
  console.log(`${colors.bold}📊 Statistiques:${colors.reset}`);
  console.log(`   Valeurs extraites: ${result.stats.totalExtracted}`);
  console.log(`   Normalisées: ${result.stats.successfullyNormalized}`);
  console.log(`   Conversions: ${result.stats.conversionsApplied}`);
  console.log(`   Non reconnues: ${result.stats.unmatchedCount}`);
  console.log("");

  // Afficher les valeurs normalisées
  console.log(`${colors.bold}${colors.green}✅ Valeurs normalisées:${colors.reset}`);
  for (const v of result.normalized) {
    const confColor =
      v.confidence === "high"
        ? colors.green
        : v.confidence === "medium"
          ? colors.yellow
          : colors.red;
    const convMark = v.wasConverted ? " 🔄" : "";

    console.log(
      `   ${confColor}●${colors.reset} ${v.code.padEnd(12)} ${String(v.value).padStart(10)} ${v.unit.padEnd(10)} (${v.confidence})${convMark}`
    );

    if (v.wasConverted && v.conversionNote) {
      console.log(`      └─ ${colors.cyan}${v.conversionNote}${colors.reset}`);
    }
  }
  console.log("");

  // Afficher les valeurs non reconnues
  if (result.unmatched.length > 0) {
    console.log(`${colors.bold}${colors.yellow}⚠️ Valeurs non reconnues:${colors.reset}`);
    for (const u of result.unmatched) {
      console.log(`   • ${u.originalName}: ${u.value} ${u.unit}`);
    }
    console.log("");
  }

  // Afficher l'objet BdfInputs final
  const bdfInputs = toBdfInputs(result.normalized);
  console.log(`${colors.bold}📥 Objet BdfInputs prêt pour le formulaire:${colors.reset}`);
  console.log(JSON.stringify(bdfInputs, null, 2));
  console.log("");

  // Résumé
  const successRate = Math.round((result.stats.successfullyNormalized / result.stats.totalExtracted) * 100);
  console.log(
    `${colors.bold}${colors.green}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.green}      TEST RÉUSSI ✓  (${successRate}% de succès)${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.green}═══════════════════════════════════════════════════════════${colors.reset}\n`
  );
}

// Test unitaire des synonymes
function testSynonyms() {
  console.log(`\n${colors.bold}🔤 Test des synonymes:${colors.reset}`);

  const testCases = [
    ["HÉMATIES", "GR"],
    ["Polynucléaires Neutrophiles", "NEUT"],
    ["THYREOSTIMULINE (TSH)", "TSH"],
    ["GLYCEMIE à jeun", "GLY"],
    ["ASAT (SGOT)", "ASAT"],
    ["CREATININE", "CREAT"],
    ["CHOLESTEROL TOTAL", "CHOL"],
  ];

  let passed = 0;
  for (const [input, expected] of testCases) {
    const result = findBiomarkerCode(input);
    const ok = result === expected;
    const mark = ok ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`   ${mark} "${input}" → ${result} (attendu: ${expected})`);
    if (ok) passed++;
  }

  console.log(`\n   Résultat: ${passed}/${testCases.length} tests passés\n`);
}

// Exécuter les tests
testSynonyms();
main().catch(console.error);
