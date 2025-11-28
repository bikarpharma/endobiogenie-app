// ========================================
// TEST RAG LOCAL
// ========================================

import ragLocal from "../lib/ordonnance/ragLocalSearch";
import type { AxePerturbation } from "../lib/ordonnance/types";

async function main() {
  console.log("═".repeat(60));
  console.log("🧪 TEST RAG LOCAL");
  console.log("═".repeat(60));

  // 1. Stats
  console.log("\n📊 Statistiques RAG Local:");
  const stats = ragLocal.getRAGStats();
  console.log(`   Plantes: ${stats.totalPlantes}`);
  console.log(`   Axes: ${stats.totalAxes}`);
  console.log(`   Émonctoires: ${stats.totalEmonctoires}`);
  console.log(`   Pathologies: ${stats.totalPathologies}`);

  // 2. Test recherche par axes
  console.log("\n🔍 Test recherche par axes (corticotrope + gonadotrope):");
  const axesTest: AxePerturbation[] = [
    { axe: "corticotrope", niveau: "hyper", score: 7, justification: "Test" },
    { axe: "gonadotrope", niveau: "desequilibre", score: 5, justification: "Test" }
  ];

  const resultats = ragLocal.searchPlantesByAxes(axesTest);
  console.log(`   ${resultats.length} plantes trouvées`);

  if (resultats.length > 0) {
    console.log("\n   Top 5:");
    for (const r of resultats.slice(0, 5)) {
      console.log(`   - ${r.plante.nomLatin} (${r.plante.nomCommun})`);
      console.log(`     Score: ${r.score} | Axes: ${r.matchedAxes.join(", ")}`);
      console.log(`     Essence: ${r.plante.essence?.substring(0, 80)}...`);
    }
  }

  // 3. Test recherche par indications
  console.log("\n🔍 Test recherche par indications (digestif, nerveux):");
  const parIndications = ragLocal.searchPlantesByIndications(["digestif", "nerveux"]);
  console.log(`   ${parIndications.length} plantes trouvées`);

  if (parIndications.length > 0) {
    console.log("\n   Top 3:");
    for (const r of parIndications.slice(0, 3)) {
      console.log(`   - ${r.plante.nomLatin}: ${r.matchedIndications.join(", ")}`);
    }
  }

  // 4. Test recherche hybride
  console.log("\n🔍 Test recherche hybride (axes + indications):");
  const hybride = ragLocal.searchPlantesHybride(
    axesTest,
    ["digestif", "anti-inflammatoire"],
    { maxResults: 5, sexe: "F" }
  );

  console.log(`   ${hybride.plantes.length} plantes sélectionnées`);
  console.log(`   Score max: ${hybride.score}`);
  console.log(`   Source: ${hybride.source}`);

  if (hybride.plantes.length > 0) {
    console.log("\n   Plantes:");
    for (const p of hybride.plantes) {
      console.log(`   - ${p.nomLatin} (${p.nomCommun})`);
    }
  }

  if (hybride.axesDetails.length > 0) {
    console.log("\n   Axes détaillés:");
    for (const a of hybride.axesDetails) {
      console.log(`   - ${a.nom}: ${a.description?.substring(0, 60)}...`);
    }
  }

  if (hybride.conseilsCliniques.length > 0) {
    console.log("\n   Conseils cliniques:");
    for (const c of hybride.conseilsCliniques) {
      console.log(`   - ${c}`);
    }
  }

  // 5. Test draineurs
  console.log("\n🚿 Test draineurs (foie):");
  const draineurs = ragLocal.getDraineursForEmonctoire("foie");
  for (const d of draineurs) {
    console.log(`   - ${d.nom}: ${d.action}`);
  }

  // 6. Test plantes de référence pour axe
  console.log("\n🌿 Plantes de référence (corticotrope):");
  const plantesRef = ragLocal.getPlantesReferenceForAxe("corticotrope");
  for (const p of plantesRef.slice(0, 3)) {
    console.log(`   - ${p.nom}: ${p.action}`);
  }

  // 7. Test pathologie
  console.log("\n🏥 Test pathologie (allergies):");
  const patho = ragLocal.getPathologieTerrain("allergies");
  if (patho) {
    console.log(`   Nom: ${patho.nom}`);
    console.log(`   Description: ${patho.description}`);
    console.log(`   Terrain: ${patho.terrainPrecritique.description}`);
    console.log(`   Axes: ${patho.terrainPrecritique.axes.join(", ")}`);
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ Tests RAG Local terminés !");
  console.log("═".repeat(60));
}

main().catch(console.error);
