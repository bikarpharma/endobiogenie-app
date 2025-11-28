/**
 * Script d'import des plantes du Nord Tunisien dans Phytodex
 * Source: RAG/plante TN/PLANTES_NORD_TUNISIEN_COMPLET_ARABE (1).xlsx
 *
 * Usage: npx tsx scripts/import-plantes-tunisie.ts
 */

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

// Chemin du fichier Excel
const EXCEL_PATH = path.join(
  process.cwd(),
  "RAG/plante TN/PLANTES_NORD_TUNISIEN_COMPLET_ARABE (1).xlsx"
);

// Regex pour extraire le texte arabe
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)*/g;

// Regex pour extraire le texte entre parenthèses arabes
const ARABIC_PARENS_REGEX = /\(([^)]*[\u0600-\u06FF][^)]*)\)/;

interface ExcelRow {
  "N°": number;
  "Nom scientifique": string;
  "Nom français": string;
  "Nom vernaculaire": string;
  "Drogue": string;
  "Utilisations": string;
}

/**
 * Extraire le nom arabe du champ vernaculaire
 * Ex: "Chandgoura (شندقورة)" → "شندقورة"
 * Ex: "Acacia (أكاسيا)" → "أكاسيا"
 */
function extractArabicName(vernacular: string | undefined): string | null {
  if (!vernacular) return null;

  // D'abord chercher dans les parenthèses
  const parenMatch = vernacular.match(ARABIC_PARENS_REGEX);
  if (parenMatch) {
    return parenMatch[1].trim();
  }

  // Sinon chercher n'importe quel texte arabe
  const arabicMatches = vernacular.match(ARABIC_REGEX);
  if (arabicMatches && arabicMatches.length > 0) {
    return arabicMatches.join(" ").trim();
  }

  return null;
}

/**
 * Extraire le nom latin (en enlevant les informations en parenthèses)
 * Ex: "Achillea millefolium L." → "Achillea millefolium"
 */
function cleanLatinName(name: string | undefined): string {
  if (!name) return "";
  // Garder le nom tel quel, juste trim
  return name.trim();
}

/**
 * Catégoriser les indications basé sur les mots-clés
 */
function detectCategories(utilisations: string | undefined): string[] {
  if (!utilisations) return [];

  const text = utilisations.toLowerCase();
  const categories: string[] = [];

  const categoryKeywords: Record<string, string[]> = {
    "Digestif": ["digest", "estomac", "intestin", "foie", "hepat", "bile", "laxat", "diarrh", "colique", "gastri"],
    "Respiratoire": ["toux", "respir", "bronch", "asthme", "pulmon", "rhume", "expector"],
    "Anti-inflammatoire": ["anti-inflam", "inflammat"],
    "Dermatologique": ["peau", "dermat", "cicatri", "plaie", "blessur", "brulur", "eczem"],
    "Nerveux": ["nerv", "calm", "sedati", "anxiet", "sommeil", "insomn", "stress"],
    "Douleur": ["douleur", "analges", "antalgiq", "rhumat", "articul", "nevralg"],
    "Diurétique": ["diuret", "urin", "renal", "rein"],
    "Antibactérien": ["antibact", "antisept", "antimicrob", "infect"],
    "Cardiovasculaire": ["cardio", "coeur", "tension", "hypotens", "vein", "circul"],
    "Gynécologique": ["uter", "menstr", "regles", "ovaire", "gynec", "emmenag"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      categories.push(category);
    }
  }

  return categories;
}

async function main() {
  console.log("═".repeat(70));
  console.log("  IMPORT PLANTES NORD TUNISIEN → PHYTODEX");
  console.log("═".repeat(70));

  // 1. Lire le fichier Excel
  console.log("\n📖 Lecture du fichier Excel...");
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`   → ${rows.length} plantes trouvées`);

  // 2. Créer la source de référence pour l'import
  console.log("\n📚 Création de la source de référence...");
  let source = await prisma.sourceReference.findFirst({
    where: {
      citation: { contains: "Nord Tunisien" }
    }
  });

  if (!source) {
    source = await prisma.sourceReference.create({
      data: {
        type: "REPORT",
        citation: "Base de données ethnobotanique - Plantes du Nord Tunisien (enquêtes de terrain, tradition orale). Import initial 2024."
      }
    });
    console.log(`   → Source créée (ID: ${source.id})`);
  } else {
    console.log(`   → Source existante (ID: ${source.id})`);
  }

  // 3. Importer les plantes
  console.log("\n🌿 Import des plantes...\n");

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const latinName = cleanLatinName(row["Nom scientifique"]);

    if (!latinName) {
      console.log(`   ⚠️  Ligne ${row["N°"]}: Nom scientifique manquant, ignorée`);
      skipped++;
      continue;
    }

    // Vérifier si la plante existe déjà
    const existing = await prisma.phytodexPlant.findFirst({
      where: { latinName }
    });

    if (existing) {
      console.log(`   ⏭️  ${latinName} - déjà existante`);
      skipped++;
      continue;
    }

    try {
      // Extraire les données
      const arabicName = extractArabicName(row["Nom vernaculaire"]);
      const categories = detectCategories(row["Utilisations"]);

      // Créer la plante
      const plant = await prisma.phytodexPlant.create({
        data: {
          latinName,
          mainVernacularName: row["Nom français"]?.trim() || null,
          arabicName,
          otherVernacularNames: row["Nom vernaculaire"]?.trim() || null,
          region: "Nord Tunisie",
          partUsed: row["Drogue"]?.trim() || null,
          mainIndications: row["Utilisations"]?.trim() || null,
          mainActions: categories.length > 0 ? categories.join(", ") : null,
          safetyNotes: row["Utilisations"]?.toLowerCase().includes("toxiq")
            ? "⚠️ Plante signalée comme toxique - Précautions d'emploi requises"
            : null,
        }
      });

      // Si des utilisations existent, créer un TraditionalUse
      if (row["Utilisations"]) {
        await prisma.traditionalUse.create({
          data: {
            plantId: plant.id,
            indicationCategory: categories[0] || "Général",
            indicationDetail: row["Utilisations"].trim(),
            partUsed: row["Drogue"]?.trim() || null,
            sourceId: source.id,
            evidenceLevel: "TRADITION_ONLY"
          }
        });
      }

      const arabicDisplay = arabicName ? ` (${arabicName})` : "";
      console.log(`   ✅ ${latinName}${arabicDisplay}`);
      imported++;

    } catch (error) {
      console.log(`   ❌ ${latinName}: ${error}`);
      errors++;
    }
  }

  // 4. Résumé
  console.log("\n" + "═".repeat(70));
  console.log("  RÉSUMÉ DE L'IMPORT");
  console.log("═".repeat(70));
  console.log(`   ✅ Importées:  ${imported}`);
  console.log(`   ⏭️  Ignorées:   ${skipped}`);
  console.log(`   ❌ Erreurs:    ${errors}`);
  console.log(`   📊 Total:      ${rows.length}`);

  // Statistiques finales
  const totalPlants = await prisma.phytodexPlant.count();
  const plantsWithArabic = await prisma.phytodexPlant.count({
    where: { arabicName: { not: null } }
  });

  console.log("\n📈 État du Phytodex:");
  console.log(`   Total plantes:       ${totalPlants}`);
  console.log(`   Avec nom arabe:      ${plantsWithArabic}`);
  console.log(`   Région Nord Tunisie: ${imported}`);

  console.log("\n✨ Import terminé !");
}

main()
  .catch((e) => {
    console.error("Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
