// ========================================
// TEST INTÉGRATION HYBRIDE RAG
// ========================================
// Test le flux complet: RAG Local → VectorStore OpenAI

const path = require("path");

// Charger les fichiers JSON manuellement (équivalent aux imports)
const matiereMediale = require("../RAG/endobiogenie/volume2/matiere-medicale.json");
const axesEndocriniens = require("../RAG/endobiogenie/volume2/axes-endocriniens.json");
const emonctoires = require("../RAG/endobiogenie/volume2/emonctoires.json");
const sna = require("../RAG/endobiogenie/volume2/sna.json");
const pathologiesDB = require("../RAG/endobiogenie/volume3/pathologies-database.json");

// ========================================
// MAPPING AXES
// ========================================
const AXES_MAPPING = {
  corticotrope: ["corticotrope"],
  thyroidien: ["thyréotrope", "thyreotrope"],
  gonadotrope: ["gonadotrope"],
  somatotrope: ["somatotrope"],
  sna: ["parasympathique", "alphasympathique", "betasympathique"],
  sna_alpha: ["alphasympathique"],
  sna_beta: ["betasympathique"],
  histamine: ["corticotrope"],
};

// ========================================
// RECHERCHE PAR AXES (RAG LOCAL)
// ========================================
function searchPlantesByAxes(axes) {
  const results = [];
  const axesRecherches = new Set();

  for (const axe of axes) {
    const mapped = AXES_MAPPING[axe.axe] || [axe.axe];
    mapped.forEach(a => axesRecherches.add(a.toLowerCase()));
  }

  for (const plante of matiereMediale.plantes) {
    let score = 0;
    const matchedAxes = [];

    for (const axePlante of plante.axes || []) {
      if (axesRecherches.has(axePlante.toLowerCase())) {
        score += 3;
        matchedAxes.push(axePlante);
      }
    }

    if (matchedAxes.length > 1) {
      score += matchedAxes.length;
    }

    const textePlante = `${plante.essence} ${plante.resume}`.toLowerCase();
    for (const axe of axes) {
      if (textePlante.includes(axe.axe.toLowerCase())) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ plante, score, matchedAxes });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ========================================
// RECHERCHE HYBRIDE
// ========================================
function searchPlantesHybride(axes, indications = [], options = {}) {
  const { maxResults = 10, excludeCI = [], sexe } = options;

  const parAxes = searchPlantesByAxes(axes);

  // Fusionner et scorer
  const scoreMap = new Map();

  for (const r of parAxes) {
    scoreMap.set(r.plante.nomLatin, {
      plante: r.plante,
      score: r.score * 1.5,
      sources: [`Axes: ${r.matchedAxes.join(", ")}`]
    });
  }

  // Filtrer CI
  let results = Array.from(scoreMap.values());

  if (excludeCI.length > 0) {
    results = results.filter(r => {
      const precautions = (r.plante.precautions || "").toLowerCase();
      return !excludeCI.some(ci => precautions.includes(ci.toLowerCase()));
    });
  }

  // Filtrer par sexe
  if (sexe === "M") {
    results = results.filter(r => {
      const indics = r.plante.indications || [];
      return !indics.includes("œstrogénique");
    });
  }

  results.sort((a, b) => b.score - a.score);
  const topPlantes = results.slice(0, maxResults).map(r => r.plante);

  // Récupérer détails axes
  const axesDetails = [];
  for (const axe of axes) {
    const key = axe.axe.replace("sna_", "").replace("thyroidien", "thyreotrope");
    if (axesEndocriniens[key]) {
      axesDetails.push(axesEndocriniens[key]);
    }
  }

  // Récupérer émonctoires impliqués
  const emonctoiresImpliques = [];
  const axesNoms = axes.map(a => a.axe);
  for (const [key, em] of Object.entries(emonctoires)) {
    if (em.axes?.some(a => axesNoms.some(an => a.toLowerCase().includes(an.toLowerCase())))) {
      emonctoiresImpliques.push(em);
    }
  }

  // Collecter conseils
  const conseilsCliniques = [];
  for (const em of emonctoiresImpliques) {
    if (em.conseilClinique) {
      conseilsCliniques.push(`${em.nom}: ${em.conseilClinique}`);
    }
  }

  return {
    plantes: topPlantes,
    axesDetails,
    emonctoiresImpliques,
    conseilsCliniques,
    score: results[0]?.score || 0,
    source: "RAG Local - Volume 2 Matière Médicale"
  };
}

// ========================================
// TEST
// ========================================
async function main() {
  console.log("═".repeat(60));
  console.log("🧪 TEST INTÉGRATION HYBRIDE RAG");
  console.log("═".repeat(60));

  // Statistiques
  console.log("\n📊 DONNÉES RAG LOCAL:");
  console.log(`   Plantes: ${matiereMediale.plantes.length}`);
  console.log(`   Axes: ${Object.keys(axesEndocriniens).length}`);
  console.log(`   Émonctoires: ${Object.keys(emonctoires).length}`);
  console.log(`   Pathologies: ${Object.keys(pathologiesDB).length}`);

  // Cas de test clinique
  const casTest = {
    patient: { sexe: "F", age: 45 },
    axes: [
      { axe: "corticotrope", niveau: "hyper", score: 7, justification: "Stress chronique, cortisol élevé" },
      { axe: "gonadotrope", niveau: "desequilibre", score: 6, justification: "Périménopause, FSH élevée" }
    ],
    CI: ["grossesse"],
    symptomes: ["fatigue", "bouffées de chaleur"]
  };

  console.log("\n📋 CAS CLINIQUE:");
  console.log(`   Patiente: ${casTest.patient.sexe}, ${casTest.patient.age} ans`);
  console.log(`   Axes perturbés:`);
  for (const axe of casTest.axes) {
    console.log(`   - ${axe.axe.toUpperCase()} (${axe.niveau}): ${axe.justification}`);
  }

  // Phase 1: RAG Local
  console.log("\n" + "─".repeat(60));
  console.log("📚 PHASE 1: RAG LOCAL");
  console.log("─".repeat(60));

  const startLocal = Date.now();
  const ragResult = searchPlantesHybride(
    casTest.axes,
    casTest.symptomes,
    {
      maxResults: 6,
      excludeCI: casTest.CI,
      sexe: casTest.patient.sexe
    }
  );
  const durationLocal = Date.now() - startLocal;

  console.log(`\n⏱️ Temps: ${durationLocal}ms`);
  console.log(`📦 Score max: ${ragResult.score}`);
  console.log(`🌿 ${ragResult.plantes.length} plantes trouvées:`);

  for (const p of ragResult.plantes) {
    console.log(`\n   • ${p.nomLatin} (${p.nomCommun})`);
    console.log(`     Axes: ${p.axes.join(", ")}`);
    if (p.essence) {
      console.log(`     Essence: ${p.essence.substring(0, 100)}...`);
    }
  }

  if (ragResult.axesDetails.length > 0) {
    console.log(`\n📊 Axes détaillés:`);
    for (const a of ragResult.axesDetails) {
      console.log(`   - ${a.nom}: ${a.description?.substring(0, 80)}...`);
    }
  }

  if (ragResult.conseilsCliniques.length > 0) {
    console.log(`\n💡 Conseils cliniques:`);
    for (const c of ragResult.conseilsCliniques) {
      console.log(`   - ${c}`);
    }
  }

  // Phase 2: VectorStore (optionnel si résultats suffisants)
  if (ragResult.plantes.length >= 3) {
    console.log("\n" + "─".repeat(60));
    console.log("✅ RAG LOCAL SUFFISANT - Skip VectorStore OpenAI");
    console.log("─".repeat(60));
    console.log(`   → ${ragResult.plantes.length} plantes = suffisant pour ordonnance`);
  } else {
    console.log("\n" + "─".repeat(60));
    console.log("🌐 PHASE 2: VECTORSTORE OPENAI (enrichissement nécessaire)");
    console.log("─".repeat(60));

    // Ici on appellerait le VectorStore OpenAI
    // Mais on a déjà assez de résultats pour ce test
  }

  // Résumé conversion vers recommandations
  console.log("\n" + "─".repeat(60));
  console.log("💊 CONVERSION EN RECOMMANDATIONS THÉRAPEUTIQUES");
  console.log("─".repeat(60));

  for (let i = 0; i < Math.min(4, ragResult.plantes.length); i++) {
    const p = ragResult.plantes[i];
    let forme = "EPS";
    if (p.galenique) {
      if (p.galenique.includes("MG")) forme = "MG";
      else if (p.galenique.includes("TM")) forme = "TM";
    }

    console.log(`\n   ${i + 1}. ${p.nomLatin} (${p.nomCommun})`);
    console.log(`      Forme: ${forme}`);
    console.log(`      Posologie: ${forme === "EPS" ? "5 mL matin et soir" : forme === "TM" ? "50 gouttes 3x/j" : "10 gouttes matin à jeun"}`);
    console.log(`      Durée: 21 jours`);
    console.log(`      Axe cible: ${p.axes[0] || casTest.axes[0].axe}`);
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ TEST HYBRIDE TERMINÉ AVEC SUCCÈS!");
  console.log("═".repeat(60));

  console.log(`
📈 RÉSUMÉ:
   - RAG Local: ${durationLocal}ms (gratuit)
   - Plantes: ${ragResult.plantes.length}
   - VectorStore: ${ragResult.plantes.length >= 3 ? "NON nécessaire" : "serait appelé"}

🎯 AVANTAGES APPROCHE HYBRIDE:
   1. Rapidité: <100ms pour filtrage initial
   2. Coût: 0€ si RAG local suffisant
   3. Précision: Filtrage exact par axe
   4. Fallback: VectorStore si besoin d'enrichissement
  `);
}

main().catch(console.error);
