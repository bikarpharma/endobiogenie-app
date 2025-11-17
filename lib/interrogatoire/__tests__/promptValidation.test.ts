// ========================================
// TESTS DE VALIDATION DES PROMPTS IA
// ========================================

import { SYSTEM_PROMPT_INTERPRETATION, generateUserPrompt } from "../prompts";
import { AxeType } from "../axeInterpretation";

/**
 * Liste des termes INTERDITS dans les réponses IA
 * (noms de plantes, compléments, posologies)
 */
const FORBIDDEN_TERMS = [
  // Plantes médicinales courantes
  "rhodiola",
  "ashwagandha",
  "ginseng",
  "éleuthérocoque",
  "schisandra",
  "bacopa",
  "griffonia",
  "safran",
  "millepertuis",
  "valériane",
  "passiflore",
  "mélisse",
  "aubépine",
  "gattilier",
  "achillée",
  "alchémille",
  "fumeterre",
  "chardon-marie",
  "desmodium",
  "radis noir",
  "artichaut",
  "pissenlit",
  "bardane",
  "curcuma",
  "gingembre",
  "boswellia",
  "saule blanc",
  "harpagophytum",
  "échinacée",
  "sureau",
  "thym",
  "origan",
  "propolis",

  // Bourgeons de gemmothérapie
  "figuier",
  "cassis",
  "tilleul",
  "aubépine bourgeon",
  "romarin bourgeon",
  "framboisier",
  "airelle",
  "vigne rouge",
  "noyer",
  "aulne",
  "églantier",
  "séquoia",

  // Huiles essentielles
  "lavande",
  "menthe poivrée",
  "ravintsara",
  "tea tree",
  "eucalyptus",
  "camomille he",
  "ylang-ylang",
  "bergamote",
  "mandarine",
  "petit grain",

  // Compléments alimentaires
  "magnésium",
  "vitamine d",
  "vitamine b",
  "omega-3",
  "omega 3",
  "probiotiques",
  "zinc",
  "sélénium",
  "fer",
  "iode complément",
  "coq10",
  "coenzyme q10",
  "glutathion",
  "nac",
  "n-acétylcystéine",
  "glutamine",
  "collagène",
  "mélatonine complément",

  // Posologies et durées
  " mg",
  " g/jour",
  "gouttes",
  "gélules",
  "comprimés",
  "pendant 3 mois",
  "pendant 6 semaines",
  "matin et soir",
  "3 fois par jour",
  "à jeun",
  "pendant les repas",
];

/**
 * Termes AUTORISÉS (génériques, non thérapeutiques)
 */
const ALLOWED_GENERIC_TERMS = [
  "plantes régulatrices",
  "modulateurs thyroïdiens",
  "draineurs hépatiques",
  "adaptogènes surrénaliens",
  "support du microbiote",
  "anti-inflammatoires naturels",
  "régulateurs du système nerveux autonome",
  "plantes régulatrices de l'axe hhs",
  "modulateurs parasympathiques",
  "stimulants thyroïdiens doux",
  "facilitateurs de la conversion t4→t3",
  "protecteurs thyroïdiens",
];

/**
 * Détecte si un texte contient des termes interdits
 */
function containsForbiddenTerms(text: string): { hasForbidden: boolean; terms: string[] } {
  const textLower = text.toLowerCase();
  const foundTerms: string[] = [];

  for (const term of FORBIDDEN_TERMS) {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }

  return {
    hasForbidden: foundTerms.length > 0,
    terms: foundTerms,
  };
}

/**
 * Teste si le prompt système contient les bonnes instructions
 */
describe("Prompt système - Instructions de base", () => {
  test("Le prompt système doit interdire explicitement les plantes", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("INTERDICTIONS ABSOLUES");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("JAMAIS");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("noms de plantes médicinales");
  });

  test("Le prompt système doit interdire les bourgeons de gemmothérapie", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("bourgeons de gemmothérapie");
  });

  test("Le prompt système doit interdire les huiles essentielles", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("huiles essentielles");
  });

  test("Le prompt système doit interdire les compléments alimentaires", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("compléments alimentaires");
  });

  test("Le prompt système doit interdire les posologies", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("posologies");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("durées de traitement");
  });

  test("Le prompt système doit fournir des exemples de termes génériques autorisés", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("UTILISE UNIQUEMENT DES TERMES GÉNÉRIQUES");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("Plantes régulatrices de l'axe HHS");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("Modulateurs thyroïdiens doux");
  });

  test("Le prompt système doit demander un format JSON structuré", () => {
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("Format de réponse OBLIGATOIRE en JSON");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("orientation");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("mecanismes");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("prudences");
    expect(SYSTEM_PROMPT_INTERPRETATION).toContain("modulateurs");
  });
});

/**
 * Teste la génération des prompts utilisateur pour chaque axe
 */
describe("Prompts utilisateur - Validation par axe", () => {
  const axes: AxeType[] = [
    "neurovegetatif",
    "adaptatif",
    "thyroidien",
    "gonadique",
    "digestif",
    "immuno",
    "rythmes",
    "axesdevie",
  ];

  const mockContext = {
    sexe: "F" as const,
    age: 35,
    antecedents: "Hypothyroïdie traitée",
    traitements: "Levothyrox 75µg",
    contreindicationsMajeures: ["Grossesse"],
  };

  const mockReponsesAxe = {
    question1: "Fatigue intense",
    question2: "Frilosité importante",
    question3: "Prise de poids",
  };

  axes.forEach((axe) => {
    test(`Le prompt pour l'axe ${axe} ne doit pas contenir de termes interdits`, () => {
      const userPrompt = generateUserPrompt(axe, mockReponsesAxe, mockContext);

      const check = containsForbiddenTerms(userPrompt);

      if (check.hasForbidden) {
        console.error(`❌ Termes interdits trouvés dans le prompt ${axe}:`, check.terms);
      }

      expect(check.hasForbidden).toBe(false);
    });

    test(`Le prompt pour l'axe ${axe} doit mentionner des modulateurs génériques`, () => {
      const userPrompt = generateUserPrompt(axe, mockReponsesAxe, mockContext);

      // Le prompt doit parler de "modulateurs" de manière générique
      expect(
        userPrompt.toLowerCase().includes("modulateur") ||
        userPrompt.toLowerCase().includes("régulateur") ||
        userPrompt.toLowerCase().includes("adaptogène")
      ).toBe(true);
    });
  });
});

/**
 * TESTS MANUELS (à exécuter avec de vraies réponses IA)
 *
 * Ces tests doivent être lancés manuellement en appelant l'API d'interprétation
 * pour vérifier que les réponses réelles ne contiennent jamais de plantes
 */
describe("Tests d'intégration (MANUELS - avec API IA)", () => {
  // Ce test doit être lancé manuellement avec de vraies réponses IA
  test.skip("Validation manuelle : les réponses IA ne doivent jamais contenir de plantes", async () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  TEST MANUEL : Validation des réponses IA                      ║
╚════════════════════════════════════════════════════════════════╝

Instructions pour tester manuellement :

1. Créer un patient de test avec interrogatoire complet
2. Générer les 8 interprétations IA pour tous les axes
3. Pour CHAQUE interprétation, vérifier manuellement :

   ✅ AUTORISÉ :
   - "Plantes régulatrices de l'axe HHS"
   - "Modulateurs thyroïdiens doux"
   - "Draineurs hépatiques"
   - "Adaptogènes surrénaliens"
   - "Support du microbiote"
   - "Anti-inflammatoires naturels"

   ❌ INTERDIT (exemples) :
   - "Rhodiola"
   - "Ashwagandha"
   - "Magnésium"
   - "Vitamine D"
   - "Figuier en bourgeon"
   - "Lavande HE"
   - "3 gélules par jour"
   - "Pendant 3 mois"

4. Si vous trouvez un terme interdit, noter :
   - Quel axe ?
   - Quel terme précis ?
   - Dans quel champ ? (orientation, mecanismes, modulateurs, etc.)

5. Ajuster le prompt de l'axe concerné si nécessaire

══════════════════════════════════════════════════════════════════

Exemple de code pour tester :

\`\`\`typescript
import { containsForbiddenTerms } from './promptValidation.test';

const interpretation = {
  orientation: "Profil hypothyroïdien périphérique",
  mecanismes: ["Mauvaise conversion T4→T3", "..."],
  modulateurs: ["Stimulants thyroïdiens doux", "Facilitateurs de conversion"],
  // ...
};

// Vérifier chaque champ
Object.entries(interpretation).forEach(([key, value]) => {
  const text = Array.isArray(value) ? value.join(' ') : String(value);
  const check = containsForbiddenTerms(text);

  if (check.hasForbidden) {
    console.error(\`❌ Termes interdits dans \${key}:\`, check.terms);
  } else {
    console.log(\`✅ \${key} : OK\`);
  }
});
\`\`\`
    `);
  });
});

// Export pour utilisation dans d'autres tests
export { containsForbiddenTerms, FORBIDDEN_TERMS, ALLOWED_GENERIC_TERMS };
