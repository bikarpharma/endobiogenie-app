// ========================================
// LISTE LES FICHIERS DANS CHAQUE VECTORSTORE
// ========================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const VECTORSTORES = {
  endobiogenie: "vs_68e87a07ae6c81918d805c8251526bda",
  phyto: "vs_68feb856fedc81919ef239741143871e",
  gemmo: "vs_68fe63bee4bc8191b2ab5e6813d5bed2",
  aroma: "vs_68feabf4185c8191afbadcc2cfe972a7",
};

async function listFilesInVectorStore(name: string, id: string) {
  console.log(`\n📂 ${name.toUpperCase()} (${id})`);
  console.log("─".repeat(60));

  try {
    // Lister les fichiers dans le vectorstore
    const response = await fetch(
      `https://api.openai.com/v1/vector_stores/${id}/files`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    if (!response.ok) {
      console.log(`❌ Erreur ${response.status}`);
      return;
    }

    const data = await response.json();
    const files = data.data || [];

    if (files.length === 0) {
      console.log("   (aucun fichier)");
      return;
    }

    // Pour chaque fichier, récupérer les détails
    for (const file of files) {
      const fileId = file.id;

      // Récupérer les infos du fichier
      const fileResponse = await fetch(
        `https://api.openai.com/v1/files/${fileId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        const sizeMB = (fileData.bytes / 1024 / 1024).toFixed(2);
        console.log(`   📄 ${fileData.filename}`);
        console.log(`      Taille: ${sizeMB} MB`);
        console.log(`      Status: ${file.status}`);
        console.log(`      Créé: ${new Date(fileData.created_at * 1000).toLocaleDateString()}`);
        console.log("");
      } else {
        console.log(`   📄 File ID: ${fileId} (détails inaccessibles)`);
        console.log(`      Status: ${file.status}`);
        console.log("");
      }
    }
  } catch (error: any) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

async function main() {
  console.log("═".repeat(60));
  console.log("📚 CONTENU DES VECTORSTORES OPENAI");
  console.log("═".repeat(60));

  for (const [name, id] of Object.entries(VECTORSTORES)) {
    await listFilesInVectorStore(name, id);
  }

  console.log("\n" + "═".repeat(60));
  console.log("📊 ANALYSE");
  console.log("═".repeat(60));
  console.log(`
Ce qui est dans les VectorStores OpenAI:
- endobiogenie: 4 fichiers (probablement les 4 volumes PDF)
- phyto: 1 fichier (manuel phytothérapie)
- gemmo: 1 fichier (livre gemmothérapie)
- aroma: 1 fichier (livre aromathérapie)

À comparer avec le RAG local extrait:
- volume1/: Anamnèse
- volume2/: Matière médicale (50 plantes), Axes, SNA, Émonctoires
- volume3/: Pathologies
`);
}

main();
