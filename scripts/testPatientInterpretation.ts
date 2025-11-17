// ========================================
// SCRIPT DE TEST COMPLET SUR PATIENT RÉEL
// ========================================

/**
 * Ce script permet de tester le système d'interprétation IA sur un patient réel
 * et de vérifier automatiquement que les réponses ne contiennent jamais de plantes
 */

import { AxeType } from "../lib/interrogatoire/axeInterpretation";

/**
 * Liste des termes INTERDITS (identique au script de validation)
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
  "aubépine bourgeon", "romarin bourgeon", "airelle", "vigne rouge bourgeon",
  "noyer bourgeon", "aulne bourgeon", "églantier bourgeon", "séquoia bourgeon",

  // HE
  "lavande", "menthe poivrée", "ravintsara", "tea tree", "eucalyptus",
  "camomille he", "ylang-ylang", "bergamote", "mandarine he", "petit grain",

  // Compléments
  "magnésium", "vitamine d", "vitamine b", "omega-3", "probiotiques",
  "zinc complément", "sélénium complément", "fer complément",
  "iode complément", "coq10", "coenzyme q10", "glutathion", "nac",
  "n-acétylcystéine", "glutamine", "collagène", "mélatonine complément",

  // Posologies
  " mg", " g/jour", "gouttes", "gélules", "comprimés",
  "pendant 3 mois", "pendant 6 semaines", "matin et soir",
  "3 fois par jour", "à jeun", "pendant les repas",
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
 * Valide une interprétation complète
 */
interface InterpretationToValidate {
  axe: AxeType;
  orientation: string;
  mecanismes: string[];
  prudences: string[];
  modulateurs: string[];
  resumeClinique: string;
  confiance: number;
}

function validateInterpretation(interp: InterpretationToValidate): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Vérifier chaque champ
  const fieldsToCheck = {
    orientation: interp.orientation,
    mecanismes: interp.mecanismes.join(" "),
    prudences: interp.prudences.join(" "),
    modulateurs: interp.modulateurs.join(" "),
    resumeClinique: interp.resumeClinique,
  };

  for (const [fieldName, fieldValue] of Object.entries(fieldsToCheck)) {
    const check = containsForbiddenTerms(fieldValue);
    if (check.hasForbidden) {
      errors.push(`❌ Champ "${fieldName}" contient des termes interdits : ${check.terms.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ========================================
// GUIDE DE TEST MANUEL
// ========================================

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║  GUIDE DE TEST COMPLET - PATIENT RÉEL                          ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

console.log("📋 ÉTAPE 1 : Créer un patient de test");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
1. Ouvrir l'application : npm run dev
2. Se connecter avec votre compte
3. Créer un nouveau patient avec des données réalistes :
   - Nom : TEST
   - Prénom : Patient
   - Sexe : F ou H
   - Date de naissance : ex. 1985-05-15
   - Antécédents : "Hypothyroïdie traitée, fatigue chronique"
   - Traitements : "Levothyrox 75µg"

4. Noter l'ID du patient (visible dans l'URL)
`);

console.log("\n📋 ÉTAPE 2 : Remplir un interrogatoire complet");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
1. Aller dans l'onglet "Interrogatoire" du patient
2. Remplir au moins 3-4 axes complets (par exemple) :
   - Axe Neurovégétatif
   - Axe Adaptatif (Stress)
   - Axe Thyroïdien
   - Axe Digestif & Métabolique

3. Répondre de manière réaliste aux questions
4. Enregistrer l'interrogatoire
`);

console.log("\n📋 ÉTAPE 3 : Générer les interprétations IA");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
L'interprétation devrait se générer automatiquement après avoir sauvegardé
l'interrogatoire. Sinon, utiliser cette requête API manuellement :

POST /api/interrogatoire/interpret
Content-Type: application/json

{
  "patientId": "PATIENT_ID_ICI",
  "axe": "thyroidien",
  "reponsesAxe": { ... },
  "sexe": "F",
  "age": 35,
  "antecedents": "Hypothyroïdie traitée",
  "traitements": "Levothyrox 75µg"
}

Répéter pour chaque axe rempli.
`);

console.log("\n📋 ÉTAPE 4 : Validation automatique des interprétations");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
1. Récupérer les interprétations via :
   GET /api/interrogatoire/interpret?patientId=PATIENT_ID_ICI

2. Pour chaque interprétation, utiliser la fonction de validation :

   import { validateInterpretation } from './testPatientInterpretation';

   const interpretation = {
     axe: "thyroidien",
     orientation: "Profil hypothyroïdien périphérique...",
     mecanismes: ["Mauvaise conversion T4→T3", "..."],
     prudences: ["Surveiller TSH", "..."],
     modulateurs: ["Stimulants thyroïdiens doux", "..."],
     resumeClinique: "Le patient présente...",
     confiance: 0.85
   };

   const validation = validateInterpretation(interpretation);

   if (!validation.isValid) {
     console.error("❌ PROBLÈME DÉTECTÉ :");
     validation.errors.forEach(err => console.error(err));
   } else {
     console.log("✅ Interprétation valide");
   }
`);

console.log("\n📋 ÉTAPE 5 : Vérification manuelle de la cohérence");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
Pour CHAQUE interprétation, vérifier manuellement :

✅ QUALITÉ CLINIQUE :
- L'orientation identifiée est-elle cohérente avec les réponses ?
- Les mécanismes sont-ils pertinents en endobiogénie ?
- Les prudences sont-elles appropriées ?
- Le score de confiance est-il justifié ?

✅ RESPECT DES CONTRAINTES :
- AUCUN nom de plante médicinale
- AUCUN bourgeon de gemmothérapie
- AUCUNE huile essentielle
- AUCUN complément alimentaire spécifique
- AUCUNE posologie ou durée
- SEULEMENT des termes génériques comme :
  ✓ "Modulateurs thyroïdiens doux"
  ✓ "Plantes régulatrices de l'axe HHS"
  ✓ "Draineurs hépatiques"
  ✓ "Adaptogènes surrénaliens"

✅ COHÉRENCE GLOBALE :
- Les 8 axes sont-ils cohérents entre eux ?
- Les orientations se complètent-elles logiquement ?
- La fusion clinique (BdF + RAG + IA) est-elle harmonieuse ?
`);

console.log("\n📋 ÉTAPE 6 : Test de génération d'ordonnance");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
1. Générer une ordonnance pour le patient de test :
   POST /api/ordonnances/generate

2. Vérifier que l'ordonnance :
   - Intègre bien les interprétations IA (visible dans les justifications)
   - Utilise les 4 sources (Clinique + BdF + RAG + IA)
   - Affiche des niveaux de confiance appropriés
   - Propose des plantes PRÉCISES (car on est au niveau thérapeutique)

3. Vérifier dans les logs :
   - "📊 [Fusion Niveau 2] Démarrage avec X interprétations IA disponibles"
   - "✅ Thyroïdien: Interprétation IA intégrée (confiance: 0.XX)"
   - "✅ Adaptatif: Interprétation IA intégrée (confiance: 0.XX)"
   - etc.
`);

console.log("\n📋 ÉTAPE 7 : Test d'invalidation automatique");
console.log("─────────────────────────────────────────────────────────────────");
console.log(`
1. Modifier une réponse de l'interrogatoire pour l'axe thyroïdien
2. Sauvegarder
3. Vérifier que l'interprétation de l'axe thyroïdien a été supprimée
4. Régénérer l'interprétation
5. Vérifier qu'elle tient compte des nouvelles réponses
`);

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║  EXEMPLE DE CODE COMPLET POUR TESTER UNE INTERPRÉTATION       ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

console.log(`
// Exemple d'utilisation complète
async function testPatientInterpretations(patientId: string) {
  // 1. Récupérer toutes les interprétations
  const response = await fetch(
    \`/api/interrogatoire/interpret?patientId=\${patientId}\`
  );
  const data = await response.json();

  console.log(\`📊 \${data.interpretations.length} interprétations trouvées\`);

  // 2. Valider chaque interprétation
  let allValid = true;
  for (const interp of data.interpretations) {
    console.log(\`\\n🔍 Validation de l'axe: \${interp.axe}\`);

    const validation = validateInterpretation(interp);

    if (!validation.isValid) {
      console.error(\`❌ PROBLÈME sur l'axe \${interp.axe}:\`);
      validation.errors.forEach(err => console.error(\`  \${err}\`));
      allValid = false;
    } else {
      console.log(\`✅ Axe \${interp.axe} : VALIDE\`);
      console.log(\`   Confiance: \${interp.confiance}\`);
      console.log(\`   Orientation: \${interp.orientation.substring(0, 80)}...\`);
    }
  }

  if (allValid) {
    console.log(\`\\n✅ TOUTES LES INTERPRÉTATIONS SONT VALIDES !\`);
  } else {
    console.error(\`\\n❌ CERTAINES INTERPRÉTATIONS CONTIENNENT DES ERREURS\`);
  }

  return allValid;
}

// Utilisation
testPatientInterpretations("PATIENT_ID_ICI");
`);

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║  CHECKLIST FINALE                                              ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

const checklist = [
  "✅ Prompt système contient bien les interdictions",
  "✅ Les 8 prompts spécialisés ne contiennent aucun terme interdit",
  "✅ Patient de test créé avec interrogatoire complet",
  "✅ Les 8 interprétations IA générées sans erreur",
  "✅ Aucune interprétation ne contient de noms de plantes",
  "✅ Aucune interprétation ne contient de posologies",
  "✅ Les modulateurs sont bien génériques",
  "✅ Les scores de confiance sont cohérents (0.0-1.0)",
  "✅ Les orientations sont pertinentes cliniquement",
  "✅ La fusion clinique intègre bien les 4 sources",
  "✅ L'ordonnance générée utilise bien les interprétations IA",
  "✅ L'invalidation automatique fonctionne après modification",
];

console.log("Checklist de validation :");
checklist.forEach(item => console.log(`  ${item}`));

console.log("\n🎯 Une fois tous les tests passés, l'implémentation est validée !\n");

// Export des fonctions utilitaires
export { validateInterpretation, containsForbiddenTerms };
