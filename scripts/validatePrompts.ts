// ========================================
// SCRIPT DE VALIDATION DES PROMPTS IA
// Vérifie que les prompts n'autorisent jamais les plantes
// ========================================

import { SYSTEM_PROMPT_INTERPRETATION, generateUserPrompt } from "../lib/interrogatoire/prompts";
import { AxeType } from "../lib/interrogatoire/axeInterpretation";

/**
 * Liste des termes INTERDITS dans les réponses IA
 */
const FORBIDDEN_TERMS = [
  // Plantes médicinales
  "rhodiola", "ashwagandha", "ginseng", "éleuthérocoque", "schisandra",
  "bacopa", "griffonia", "safran", "millepertuis", "valériane",
  "passiflore", "mélisse", "aubépine", "gattilier", "achillée",
  "fumeterre", "chardon-marie", "desmodium", "radis noir", "artichaut",
  "pissenlit", "bardane", "curcuma", "gingembre", "boswellia",
  "saule blanc", "harpagophytum", "échinacée", "sureau", "thym", "origan",

  // Bourgeons
  "figuier", "cassis bourgeon", "tilleul bourgeon", "framboisier bourgeon",

  // HE
  "lavande", "menthe poivrée", "ravintsara", "tea tree", "eucalyptus",

  // Compléments
  "magnésium", "vitamine d", "vitamine b", "omega-3", "probiotiques",
  "zinc", "sélénium", "fer", "coq10", "glutathion", "nac", "mélatonine complément",

  // Posologies
  " mg", " g/jour", "gouttes", "gélules", "comprimés", "pendant 3 mois",
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

// ========================================
// TESTS
// ========================================

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║  VALIDATION DES PROMPTS IA - Endobiogénie                      ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

let allTestsPassed = true;

// Test 1 : Prompt système
console.log("📋 Test 1 : Prompt système - Instructions de base");
console.log("─────────────────────────────────────────────────────────────────");

const systemTests = [
  { name: "Interdiction des plantes", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("noms de plantes médicinales") },
  { name: "Interdiction des bourgeons", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("bourgeons de gemmothérapie") },
  { name: "Interdiction des HE", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("huiles essentielles") },
  { name: "Interdiction des compléments", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("compléments alimentaires") },
  { name: "Interdiction des posologies", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("posologies") },
  { name: "Exemples de termes génériques", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("UTILISE UNIQUEMENT DES TERMES GÉNÉRIQUES") },
  { name: "Format JSON structuré", check: () => SYSTEM_PROMPT_INTERPRETATION.includes("Format de réponse OBLIGATOIRE en JSON") },
];

systemTests.forEach((test) => {
  const passed = test.check();
  console.log(passed ? `  ✅ ${test.name}` : `  ❌ ${test.name}`);
  if (!passed) allTestsPassed = false;
});

console.log();

// Test 2 : Vérification qu'aucun prompt ne contient de termes interdits
console.log("📋 Test 2 : Prompts utilisateur - Validation par axe");
console.log("─────────────────────────────────────────────────────────────────");

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
  const userPrompt = generateUserPrompt(axe, mockReponsesAxe, mockContext);
  const check = containsForbiddenTerms(userPrompt);

  if (check.hasForbidden) {
    console.log(`  ❌ Axe ${axe} : Termes interdits trouvés :`, check.terms);
    allTestsPassed = false;
  } else {
    console.log(`  ✅ Axe ${axe} : Aucun terme interdit`);
  }

  // Vérifier que le prompt mentionne des modulateurs génériques
  const hasGenericTerms =
    userPrompt.toLowerCase().includes("modulateur") ||
    userPrompt.toLowerCase().includes("régulateur") ||
    userPrompt.toLowerCase().includes("adaptogène");

  if (!hasGenericTerms) {
    console.log(`  ⚠️  Axe ${axe} : Pas de mention de modulateurs génériques`);
  }
});

console.log();

// Test 3 : Vérifier que le prompt système ne contient pas de termes interdits EN DEHORS de la section exemples
console.log("📋 Test 3 : Prompt système - Pas de termes interdits (hors exemples)");
console.log("─────────────────────────────────────────────────────────────────");

// On retire la section INTERDICTIONS pour éviter les faux positifs (elle contient des exemples de ce qu'il ne faut PAS faire)
const systemPromptWithoutExamples = SYSTEM_PROMPT_INTERPRETATION
  .replace(/⚠️ INTERDICTIONS ABSOLUES.*?✅ UTILISE UNIQUEMENT/s, "✅ UTILISE UNIQUEMENT");

const systemCheck = containsForbiddenTerms(systemPromptWithoutExamples);
if (systemCheck.hasForbidden) {
  console.log(`  ❌ Le prompt système contient des termes interdits :`, systemCheck.terms);
  allTestsPassed = false;
} else {
  console.log(`  ✅ Le prompt système ne contient aucun terme interdit (hors section exemples)`);
}

console.log();

// Résumé
console.log("╔════════════════════════════════════════════════════════════════╗");
if (allTestsPassed) {
  console.log("║  ✅ TOUS LES TESTS SONT PASSÉS                                  ║");
  console.log("║                                                                ║");
  console.log("║  Les 8 prompts spécialisés respectent bien les contraintes :  ║");
  console.log("║  - Aucun nom de plante médicinale                              ║");
  console.log("║  - Aucun bourgeon de gemmothérapie                             ║");
  console.log("║  - Aucune huile essentielle                                    ║");
  console.log("║  - Aucun complément alimentaire                                ║");
  console.log("║  - Aucune posologie ou durée de traitement                     ║");
  console.log("║  - Seulement des termes génériques                             ║");
} else {
  console.log("║  ❌ CERTAINS TESTS ONT ÉCHOUÉ                                   ║");
  console.log("║                                                                ║");
  console.log("║  Veuillez corriger les prompts concernés                       ║");
}
console.log("╚════════════════════════════════════════════════════════════════╝");

console.log();
console.log("📝 PROCHAINE ÉTAPE : Tests manuels avec l'API IA");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
Pour tester que les RÉPONSES IA ne contiennent jamais de plantes :

1. Créer un patient de test avec interrogatoire complet
2. Générer les 8 interprétations IA pour tous les axes
3. Pour chaque interprétation, vérifier manuellement les champs :
   - orientation
   - mecanismes
   - prudences
   - modulateurs
   - resumeClinique

4. Utiliser cette fonction pour valider chaque champ :

   import { containsForbiddenTerms } from './validatePrompts';

   const interpretation = { ... };
   Object.entries(interpretation).forEach(([key, value]) => {
     const text = Array.isArray(value) ? value.join(' ') : String(value);
     const check = containsForbiddenTerms(text);
     if (check.hasForbidden) {
       console.error(\`❌ \${key}:\`, check.terms);
     }
   });
`);

process.exit(allTestsPassed ? 0 : 1);
