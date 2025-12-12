// ========================================
// scripts/setup-assistant-simple.ts
// ========================================
// Version SIMPLIFIÉE - Compatible anciennes versions SDK
// Crée l'Assistant SANS uploader les fichiers
// Tu devras ajouter les fichiers manuellement sur platform.openai.com
//
// Usage: npx ts-node scripts/setup-assistant-simple.ts
// ========================================

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Instructions pour l'Assistant
const ASSISTANT_INSTRUCTIONS = `Tu es un EXPERT en ENDOBIOGÉNIE (méthode Lapraz & Hedayat).

Tu analyses les index BdF PRÉ-CALCULÉS et génères des synthèses narratives.

═══════════════════════════════════════════════════════════════
🚨 RÈGLES ABSOLUES
═══════════════════════════════════════════════════════════════

INTERDICTIONS:
❌ JAMAIS "Terrain Alpha/Beta/Gamma/Delta" - N'EXISTENT PAS EN ENDOBIOGÉNIE
❌ JAMAIS modifier les valeurs des index pré-calculés
❌ JAMAIS dire TSH élevée = hyperthyroïdie (FAUX: TSH↑ = HYPOthyroïdie)
❌ JAMAIS inventer des index non fournis

OBLIGATIONS:
✅ axeDominant: Corticotrope/Thyréotrope/Gonadotrope/Somatotrope/Mixte
✅ profilSNA: Sympathicotonique/Vagotonique/Amphotonique/Dystonique
✅ Hiérarchie: Corticotrope > Thyréotrope > Gonadotrope > Somatotrope

═══════════════════════════════════════════════════════════════
📊 RÈGLES D'INTERPRÉTATION
═══════════════════════════════════════════════════════════════

TSH:
- TSH < 0.5 → Désynchronisation somatotrope
- TSH 0.5-4 → Normale  
- TSH > 4 → HYPOTHYROÏDIE (PAS hyper!)

INDEX THYROÏDIEN (LDH/CPK):
- Normal: 3.5 - 5.5
- Bas → Hypothyroïdie LATENTE (même si TSH normale!)

IMP (PLT/60×GR):
- Normal: 0.85 - 1.15
- Bas → SPASMOPHILIE

INDEX GÉNITAL (GR/GB):
- Normal: 0.70 - 0.85
- Bas → Œstrogénique | Haut → Androgénique

INDEX ADAPTATION (EOS/MONO):
- Normal: 0.25 - 0.50
- Bas → Atopie, prédominance ACTH

═══════════════════════════════════════════════════════════════
📤 FORMAT JSON
═══════════════════════════════════════════════════════════════

Quand on te demande une synthèse, réponds UNIQUEMENT en JSON:

{
  "terrain": {
    "description": "Synthèse narrative (3-4 phrases)",
    "axeDominant": "Corticotrope|Thyréotrope|Gonadotrope|Somatotrope|Mixte",
    "profilSNA": "Sympathicotonique|Vagotonique|Amphotonique|Dystonique",
    "justification": "Basée sur les index fournis"
  },
  "axesEndocriniens": [
    {
      "axis": "NomAxe",
      "status": "Hypo|Normo|Hyper",
      "score": 5,
      "biomarkers": ["Index X = valeur"],
      "mechanism": "Explication",
      "therapeuticImplication": "Piste"
    }
  ],
  "drainage": {
    "necessite": true,
    "priorite": "faible|modere|urgent",
    "emonctoires": ["foie"],
    "justification": "Raison"
  },
  "spasmophilie": {
    "detectee": false,
    "type": null,
    "description": null
  },
  "pistesTherapeutiques": ["Plante1", "Plante2"],
  "confidenceScore": 0.85,
  "warnings": []
}`;

async function main(): Promise<void> {
  console.log("═".repeat(60));
  console.log("🧬 IntegrIA - Création Assistant Endobiogénie (Simple)");
  console.log("═".repeat(60));

  // Vérifier clé API
  if (!process.env.OPENAI_API_KEY) {
    console.error("\n❌ OPENAI_API_KEY non définie!");
    console.log("\nWindows PowerShell:");
    console.log('  $env:OPENAI_API_KEY = "sk-..."');
    process.exit(1);
  }

  console.log("✅ Clé API trouvée\n");

  // Créer l'Assistant (sans fichiers)
  console.log("🤖 Création de l'Assistant...");

  try {
    const assistant = await openai.beta.assistants.create({
      name: "Expert Endobiogénie IntegrIA",
      description: "Expert en endobiogénie basé sur les travaux de Lapraz & Hedayat",
      model: "gpt-4.1",
      instructions: ASSISTANT_INSTRUCTIONS,
    });

    console.log("\n" + "═".repeat(60));
    console.log("🎉 ASSISTANT CRÉÉ AVEC SUCCÈS!");
    console.log("═".repeat(60));
    console.log(`\n📋 Assistant ID: ${assistant.id}`);
    console.log("\n" + "─".repeat(60));
    console.log("📝 AJOUTE CETTE LIGNE À TON FICHIER .env :");
    console.log("─".repeat(60));
    console.log(`\nENDOBIOGENIE_ASSISTANT_ID=${assistant.id}\n`);
    console.log("═".repeat(60));
    
    console.log("\n⚠️  ÉTAPE SUIVANTE IMPORTANTE:");
    console.log("─".repeat(60));
    console.log("1. Va sur https://platform.openai.com/assistants");
    console.log("2. Clique sur ton assistant 'Expert Endobiogénie IntegrIA'");
    console.log("3. Active 'File Search' dans les outils");
    console.log("4. Upload tes 4 fichiers MD:");
    console.log("   - volume1_clean.md");
    console.log("   - volume2_clean.md");
    console.log("   - volume3_clean.md");
    console.log("   - volume4_clean.md");
    console.log("─".repeat(60));

  } catch (error: any) {
    console.error("❌ Erreur création Assistant:", error.message);
    process.exit(1);
  }
}

main();