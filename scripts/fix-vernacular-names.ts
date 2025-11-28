/**
 * Script de correction des noms vernaculaires
 * Sépare le nom vernaculaire tunisien (translittération) du nom arabe
 *
 * Usage: npx tsx scripts/fix-vernacular-names.ts
 */

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

const EXCEL_PATH = path.join(
  process.cwd(),
  "RAG/plante TN/PLANTES_NORD_TUNISIEN_COMPLET_ARABE (1).xlsx"
);

// Regex pour extraire le texte arabe entre parenthèses
const ARABIC_PARENS_REGEX = /\(([^)]*[\u0600-\u06FF][^)]*)\)/g;

interface ExcelRow {
  "N°": number;
  "Nom scientifique": string;
  "Nom français": string;
  "Nom vernaculaire": string;
}

/**
 * Extraire le nom vernaculaire en lettres latines (translittération)
 * Ex: "Chandgoura (شندقورة)" → "Chandgoura"
 * Ex: "Akhilia (أخيليا) (feuille poilue)" → "Akhilia (feuille poilue)"
 */
function extractVernacularLatin(vernacular: string | undefined): string | null {
  if (!vernacular) return null;

  // Enlever les parties entre parenthèses qui contiennent de l'arabe
  let result = vernacular.replace(ARABIC_PARENS_REGEX, "").trim();

  // Nettoyer les espaces multiples
  result = result.replace(/\s+/g, " ").trim();

  // Enlever les parenthèses vides ou espaces en début/fin
  result = result.replace(/^\s*\(\s*\)\s*/, "").replace(/\s*\(\s*\)\s*$/, "").trim();

  return result || null;
}

async function main() {
  console.log("═".repeat(70));
  console.log("  CORRECTION DES NOMS VERNACULAIRES");
  console.log("═".repeat(70));

  // 1. Lire le fichier Excel
  console.log("\n📖 Lecture du fichier Excel...");
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`   → ${rows.length} plantes trouvées`);

  // 2. Créer un mapping nom latin → nom vernaculaire
  const vernacularMap = new Map<string, string>();

  for (const row of rows) {
    const latinName = row["Nom scientifique"]?.trim();
    const vernacular = row["Nom vernaculaire"];

    if (latinName && vernacular) {
      const vernacularLatin = extractVernacularLatin(vernacular);
      if (vernacularLatin) {
        vernacularMap.set(latinName, vernacularLatin);
      }
    }
  }

  console.log(`   → ${vernacularMap.size} noms vernaculaires extraits`);

  // 3. Exemples d'extraction
  console.log("\n📝 Exemples d'extraction :");
  let count = 0;
  for (const row of rows.slice(0, 10)) {
    const vernacular = row["Nom vernaculaire"];
    if (vernacular) {
      const extracted = extractVernacularLatin(vernacular);
      console.log(`   "${vernacular}"`);
      console.log(`   → "${extracted}"\n`);
      count++;
      if (count >= 5) break;
    }
  }

  // 4. Mettre à jour les plantes dans la base
  console.log("\n🔄 Mise à jour des plantes...\n");

  let updated = 0;
  let notFound = 0;

  for (const [latinName, vernacularName] of vernacularMap) {
    const plant = await prisma.phytodexPlant.findFirst({
      where: { latinName }
    });

    if (plant) {
      await prisma.phytodexPlant.update({
        where: { id: plant.id },
        data: {
          otherVernacularNames: vernacularName
        }
      });
      updated++;

      if (updated <= 10) {
        console.log(`   ✅ ${latinName} → "${vernacularName}"`);
      }
    } else {
      notFound++;
    }
  }

  if (updated > 10) {
    console.log(`   ... et ${updated - 10} autres plantes`);
  }

  // 5. Résumé
  console.log("\n" + "═".repeat(70));
  console.log("  RÉSUMÉ");
  console.log("═".repeat(70));
  console.log(`   ✅ Mises à jour:  ${updated}`);
  console.log(`   ⚠️  Non trouvées: ${notFound}`);

  // 6. Vérification
  console.log("\n📊 Vérification des données :");
  const samples = await prisma.phytodexPlant.findMany({
    where: { region: "Nord Tunisie" },
    take: 5,
    select: {
      latinName: true,
      mainVernacularName: true,
      otherVernacularNames: true,
      arabicName: true
    }
  });

  for (const p of samples) {
    console.log(`\n   ${p.latinName}`);
    console.log(`   Français: ${p.mainVernacularName || "—"}`);
    console.log(`   Vernaculaire: ${p.otherVernacularNames || "—"}`);
    console.log(`   Arabe: ${p.arabicName || "—"}`);
  }

  console.log("\n✨ Correction terminée !");
}

main()
  .catch((e) => {
    console.error("Erreur fatale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
