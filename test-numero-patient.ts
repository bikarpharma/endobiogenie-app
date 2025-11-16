// ========================================
// TEST DE LA FONCTION generateNextNumeroPatient()
// ========================================
// Ce fichier teste la génération unique des numéros patients

import { generateNextNumeroPatient } from "./types/patient";

console.log("🧪 TEST DE GÉNÉRATION DES NUMÉROS PATIENTS\n");
console.log("=" .repeat(60));

// ==========================================
// TEST 1 : Aucun patient existant
// ==========================================
console.log("\n📋 TEST 1 : Aucun patient existant");
const test1 = generateNextNumeroPatient([]);
console.log(`   Résultat : ${test1}`);
console.log(`   Attendu  : PAT-001`);
console.log(`   ✅ ${test1 === "PAT-001" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 2 : Un seul patient (PAT-001)
// ==========================================
console.log("\n📋 TEST 2 : Un patient existant (PAT-001)");
const test2 = generateNextNumeroPatient(["PAT-001"]);
console.log(`   Résultat : ${test2}`);
console.log(`   Attendu  : PAT-002`);
console.log(`   ✅ ${test2 === "PAT-002" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 3 : Trois patients consécutifs
// ==========================================
console.log("\n📋 TEST 3 : Trois patients consécutifs (PAT-001, PAT-002, PAT-003)");
const test3 = generateNextNumeroPatient(["PAT-001", "PAT-002", "PAT-003"]);
console.log(`   Résultat : ${test3}`);
console.log(`   Attendu  : PAT-004`);
console.log(`   ✅ ${test3 === "PAT-004" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 4 : Patients NON consécutifs (avec trous)
// ==========================================
console.log("\n📋 TEST 4 : Patients NON consécutifs (PAT-001, PAT-005, PAT-010)");
const test4 = generateNextNumeroPatient(["PAT-001", "PAT-005", "PAT-010"]);
console.log(`   Résultat : ${test4}`);
console.log(`   Attendu  : PAT-011 (max = 10, donc 10 + 1 = 11)`);
console.log(`   ✅ ${test4 === "PAT-011" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 5 : Ordre aléatoire (tri alphabétique VS numérique)
// ==========================================
console.log("\n📋 TEST 5 : Ordre aléatoire (PAT-099, PAT-010, PAT-002)");
console.log("   ⚠️  Ce test vérifie que le tri est NUMÉRIQUE et non alphabétique");
const test5 = generateNextNumeroPatient(["PAT-099", "PAT-010", "PAT-002"]);
console.log(`   Résultat : ${test5}`);
console.log(`   Attendu  : PAT-100 (max numérique = 99, pas 99 alphabétiquement)`);
console.log(`   ✅ ${test5 === "PAT-100" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 6 : Numéros avec padding (PAT-001, PAT-099)
// ==========================================
console.log("\n📋 TEST 6 : Passage de PAT-099 à PAT-100");
const test6 = generateNextNumeroPatient(["PAT-099"]);
console.log(`   Résultat : ${test6}`);
console.log(`   Attendu  : PAT-100`);
console.log(`   ✅ ${test6 === "PAT-100" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// TEST 7 : Simulation création successive
// ==========================================
console.log("\n📋 TEST 7 : Simulation de 5 créations successives");
let currentPatients: string[] = [];
const expectedSequence = ["PAT-001", "PAT-002", "PAT-003", "PAT-004", "PAT-005"];
let allCorrect = true;

for (let i = 0; i < 5; i++) {
  const newNumero = generateNextNumeroPatient(currentPatients);
  console.log(`   Création ${i + 1} : ${newNumero} (attendu: ${expectedSequence[i]})`);

  if (newNumero !== expectedSequence[i]) {
    allCorrect = false;
    console.log(`   ❌ ÉCHEC à la création ${i + 1}`);
  }

  currentPatients.push(newNumero);
}

console.log(`   ✅ ${allCorrect ? "TOUS LES NUMÉROS SONT CORRECTS" : "❌ ERREURS DÉTECTÉES"}`);

// ==========================================
// TEST 8 : Numéros invalides (ignorés)
// ==========================================
console.log("\n📋 TEST 8 : Numéros invalides mélangés");
const test8 = generateNextNumeroPatient(["PAT-001", "INVALID", "PAT-005", "", "PAT-003"]);
console.log(`   Résultat : ${test8}`);
console.log(`   Attendu  : PAT-006 (ignore les numéros invalides)`);
console.log(`   ✅ ${test8 === "PAT-006" ? "SUCCÈS" : "❌ ÉCHEC"}`);

// ==========================================
// RÉSUMÉ FINAL
// ==========================================
console.log("\n" + "=".repeat(60));
console.log("🎯 RÉSUMÉ DES TESTS");
console.log("=" .repeat(60));

const tests = [
  { name: "Aucun patient", result: test1 === "PAT-001" },
  { name: "Un patient", result: test2 === "PAT-002" },
  { name: "Trois patients consécutifs", result: test3 === "PAT-004" },
  { name: "Patients NON consécutifs", result: test4 === "PAT-011" },
  { name: "Tri numérique (pas alphabétique)", result: test5 === "PAT-100" },
  { name: "Passage à PAT-100", result: test6 === "PAT-100" },
  { name: "5 créations successives", result: allCorrect },
  { name: "Numéros invalides ignorés", result: test8 === "PAT-006" },
];

const passed = tests.filter((t) => t.result).length;
const total = tests.length;

tests.forEach((t) => {
  console.log(`${t.result ? "✅" : "❌"} ${t.name}`);
});

console.log("\n" + "=".repeat(60));
if (passed === total) {
  console.log(`🎉 TOUS LES TESTS RÉUSSIS (${passed}/${total})`);
  console.log("✅ La fonction generateNextNumeroPatient() fonctionne correctement !");
} else {
  console.log(`⚠️  ${passed}/${total} tests réussis`);
  console.log("❌ Des corrections sont nécessaires.");
}
console.log("=" .repeat(60) + "\n");
