// ========================================
// SCRIPT TEST VECTORSTORES
// ========================================
// Vérifie si les vectorstores OpenAI sont accessibles et fonctionnels

// Version simple : test direct via fetch API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const VECTORSTORES_TO_TEST = {
  endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda",
  phyto: "vs_68feb856fedc81919ef239741143871e",
  gemmo: "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
  aroma: "vs_68feabf4185c8191afbadcc2cfe972a7",
};

async function testVectorstore(name: string, id: string) {
  console.log(`\n🔍 Test: ${name} (${id})`);

  try {
    // Essayer de récupérer les infos du vectorstore via API REST
    const response = await fetch(`https://api.openai.com/v1/vector_stores/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 404) {
        console.log(`❌ ${name} N'EXISTE PAS (404)`);
        console.log(`   L'ID "${id}" est introuvable sur votre compte OpenAI`);
      } else if (response.status === 401) {
        console.log(`❌ Erreur d'authentification (vérifier OPENAI_API_KEY)`);
      } else {
        console.log(`❌ ${name} ERREUR (${response.status}): ${error.message || 'Erreur inconnue'}`);
      }
      return false;
    }

    const vectorStore = await response.json();

    console.log(`✅ ${name} est ACCESSIBLE`);
    console.log(`   - Statut: ${vectorStore.status}`);
    console.log(`   - Fichiers: ${vectorStore.file_counts.total} total`);
    console.log(`   - Nom: ${vectorStore.name || "Sans nom"}`);
    console.log(`   - Créé le: ${new Date(vectorStore.created_at * 1000).toLocaleDateString()}`);

    if (vectorStore.status !== "completed") {
      console.log(`   ⚠️ ATTENTION: Statut pas "completed" mais "${vectorStore.status}"`);
    }

    if (vectorStore.file_counts.total === 0) {
      console.log(`   ⚠️ ATTENTION: Aucun fichier indexé !`);
    }

    return true;
  } catch (error: any) {
    console.log(`❌ ${name} ERREUR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=" + "=".repeat(60));
  console.log("🧪 TEST DES VECTORSTORES OPENAI");
  console.log("=" + "=".repeat(60));

  const results: Record<string, boolean> = {};

  for (const [name, id] of Object.entries(VECTORSTORES_TO_TEST)) {
    results[name] = await testVectorstore(name, id);
  }

  console.log("\n" + "=" + "=".repeat(60));
  console.log("📊 RÉSUMÉ");
  console.log("=" + "=".repeat(60));

  for (const [name, success] of Object.entries(results)) {
    const icon = success ? "✅" : "❌";
    console.log(`${icon} ${name.padEnd(15)} : ${success ? "OK" : "ERREUR"}`);
  }

  const allOk = Object.values(results).every(r => r);

  if (allOk) {
    console.log("\n✅ Tous les vectorstores sont accessibles !");
  } else {
    console.log("\n❌ Certains vectorstores ont des problèmes.");
    console.log("\n💡 Solutions:");
    console.log("   1. Vérifier les IDs sur https://platform.openai.com/storage/vector_stores");
    console.log("   2. Recréer les vectorstores qui n'existent pas");
    console.log("   3. Mettre à jour les IDs dans lib/ordonnance/constants.ts");
  }
}

main();
