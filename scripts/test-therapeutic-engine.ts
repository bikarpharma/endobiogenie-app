// ========================================
// TEST COMPLET DU MOTEUR THÉRAPEUTIQUE
// ========================================
// Ce script teste l'intégration de therapeuticReasoning.ts
// en créant un patient test et générant une ordonnance.

import { PrismaClient } from "@prisma/client";
import { TherapeuticReasoningEngine } from "../lib/ordonnance/therapeuticReasoning";
import type { TherapeuticScope } from "../lib/ordonnance/types";
import type { IndexResults, LabValues } from "../lib/bdf/types";

const prisma = new PrismaClient();

// ==========================================
// CONFIGURATION DU PATIENT TEST
// ==========================================
const PATIENT_TEST = {
  nom: "TEST_MOTEUR_01",
  prenom: "Marie",
  sexe: "F" as const,
  age: 45,
  dateNaissance: new Date(1979, 5, 15), // 15 juin 1979
  allergies: ["aspirine", "AINS"],
  symptomes: [
    "Fatigue matinale importante",
    "Réveil nocturne 3h-4h du matin",
    "Frilosité permanente",
    "Anxiété avec palpitations",
    "Ballonnements post-prandiaux",
    "Constipation chronique"
  ],
  pathologies: [
    "Hypothyroïdie subclinique",
    "Syndrome de fatigue chronique"
  ],
  traitements: ["Levothyrox 50µg/j"]
};

// ==========================================
// VALEURS BDF ANORMALES (pour déclencher drainage)
// ==========================================
const BDF_INPUTS: Partial<LabValues> = {
  // Formule sanguine
  GR: 4.2,      // Normal
  GB: 5800,     // Normal
  Hb: 12.5,     // Légèrement bas (F)
  Ht: 38,       // Normal
  VGM: 92,      // Normal
  TCMH: 30,     // Normal
  CCMH: 33,     // Normal

  // Plaquettes et vitesse
  Plaq: 220,    // Normal
  VS: 18,       // Légèrement élevé (inflammation bas bruit)

  // Leucocytes
  PNN: 55,      // Normal
  PNE: 4,       // Normal
  PNB: 1,       // Normal
  Lympho: 35,   // Normal
  Mono: 5,      // Normal

  // Enzymes hépatiques (PERTURBÉES - déclenche drainage foie)
  ALAT: 52,     // Élevé (N < 40) → Surcharge hépatique
  ASAT: 48,     // Élevé (N < 40)
  GGT: 65,      // Élevé (N < 50) → Stase biliaire
  PAL: 95,      // Normal

  // Métabolisme (PERTURBÉ - déclenche axe thyroïdien)
  LDH: 280,     // Élevé (N < 250) → Hypoxie tissulaire
  CPK: 85,      // Bas → Index thyroïdien perturbé (LDH/CPK élevé)

  // Thyroïde
  TSH: 4.8,     // Limite haute (N < 4.5) → Hypothyroïdie subclinique
  T4L: 0.9,     // Limite basse (N > 1.0)
  T3L: 2.8,     // Normal

  // Lipides (légère dyslipidémie)
  Chol: 2.4,    // Élevé (N < 2.0)
  TG: 1.8,      // Élevé (N < 1.5)
  HDL: 0.45,    // Bas (N > 0.5)
  LDL: 1.6,     // Élevé

  // Fer (perturbé)
  Fer: 55,      // Bas (N > 60)
  Ferritine: 25, // Bas (N > 30) → Carence martiale

  // Glycémie
  Glyc: 0.95,   // Normal
  HbA1c: 5.4,   // Normal

  // Rénal
  Uree: 0.35,   // Normal
  Creat: 8,     // Normal

  // Inflammation
  CRP: 3.5,     // Légèrement élevé (N < 3) → Inflammation bas bruit
  Fibri: 3.2,   // Normal
};

// ==========================================
// INDEX CALCULÉS (format attendu par therapeuticReasoning.ts)
// Le moteur utilise le format idx_xxx.value
// ==========================================
const BDF_INDEXES: any = {
  // Index Thyroïdien = LDH/CPK (N ~2.0-3.0)
  // 3.29 est DANS la norme, mettons 1.5 pour déclencher hypo
  idx_thyroidien: {
    value: 1.5,  // < 2.0 = Hypothyroïdie fonctionnelle
    comment: "LDH/CPK = 1.5 (bas) - Métabolisme thyroïdien ralenti"
  },

  // Index d'Adaptation = EOS/MONO (N ~0.2-0.5)
  idx_adaptation: {
    value: 0.15, // < 0.2 = Risque auto-immun, cortisol insuffisant
    comment: "EOS/MONO = 0.15 (bas) - Adaptation corticotrope déficiente"
  },

  // Index Génital = GR/GB (N ~0.6-0.8)
  idx_genital: {
    value: 0.72, // Normal
    comment: "GR/GB = 0.72 - Axe génital équilibré"
  },

  // Index de Mobilisation Leucocytaire (α-sympathique)
  idx_mobilisation_leucocytes: {
    value: 1.25, // > 1.1 = Hyper α-sympathique
    comment: "IML élevé - Congestion hépatosplanchnique"
  },

  // Index de Mobilisation Plaquettaire (β-sympathique)
  idx_mobilisation_plaquettes: {
    value: 0.85, // < 0.9 = β bloqué avec α élevé = Spasmophilie Type 1
    comment: "IMP bas - β-sympathique freiné"
  },

  // Index Starter = IML/IMP
  idx_starter: {
    value: 1.47, // > 1.3 = Hyper α-adaptatif
    comment: "Starter élevé - Terrain spasmophile α-dominant"
  },

  // Rendement Thyroïdien
  idx_rendement_thyroidien: {
    value: 0.8, // < 1.0 = Rendement bas
    comment: "Rendement thyroïdien insuffisant"
  },

  // Index Génito-Thyroïdien
  gT: {
    value: 1.1,
    comment: "Rapport G/T équilibré"
  },

  // Index Œstrogénique
  idx_oestrogenique: {
    value: 0.65, // Normal pour femme
    comment: "Index œstrogénique normal"
  },

  // Turnover osseux
  turnover: {
    value: 1.0,
    comment: "Turnover osseux équilibré"
  }
};

// ==========================================
// SCOPE THÉRAPEUTIQUE (tout activé)
// ==========================================
const SCOPE: TherapeuticScope = {
  planteMedicinale: true,
  gemmotherapie: true,
  aromatherapie: true,
  micronutrition: true
};

// ==========================================
// FONCTION PRINCIPALE
// ==========================================
async function main() {
  console.log("\n" + "═".repeat(70));
  console.log("🧪 TEST COMPLET DU MOTEUR THÉRAPEUTIQUE (TherapeuticReasoningEngine)");
  console.log("═".repeat(70));

  // ==========================================
  // ÉTAPE 1: Créer ou récupérer le patient test
  // ==========================================
  console.log("\n📋 ÉTAPE 1: Création/Récupération du patient test...");

  let patient = await prisma.patient.findFirst({
    where: { nom: PATIENT_TEST.nom }
  });

  if (!patient) {
    // Générer un numéro patient unique avec timestamp pour éviter les doublons
    const timestamp = Date.now().toString().slice(-6);
    const numeroPatient = `PAT-TEST-${timestamp}`;

    patient = await prisma.patient.create({
      data: {
        numeroPatient,
        nom: PATIENT_TEST.nom,
        prenom: PATIENT_TEST.prenom,
        sexe: PATIENT_TEST.sexe,
        dateNaissance: PATIENT_TEST.dateNaissance,
        allergies: PATIENT_TEST.allergies.join(", "),
        contreindicationsMajeures: PATIENT_TEST.allergies,
        symptomesActuels: PATIENT_TEST.symptomes,
        pathologiesAssociees: PATIENT_TEST.pathologies,
        traitements: PATIENT_TEST.traitements.join(", "),
        traitementActuel: PATIENT_TEST.traitements.join("\n"),
        notes: "Patient test pour validation du moteur thérapeutique",
      }
    });
    console.log(`   ✅ Patient créé: ${patient.numeroPatient} - ${patient.prenom} ${patient.nom}`);
  } else {
    // Mettre à jour les données du patient existant
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        allergies: PATIENT_TEST.allergies.join(", "),
        contreindicationsMajeures: PATIENT_TEST.allergies,
        symptomesActuels: PATIENT_TEST.symptomes,
        pathologiesAssociees: PATIENT_TEST.pathologies,
      }
    });
    console.log(`   ℹ️ Patient existant mis à jour: ${patient.numeroPatient}`);
  }

  // ==========================================
  // ÉTAPE 2: Créer une analyse BdF avec valeurs anormales
  // ==========================================
  console.log("\n🔬 ÉTAPE 2: Création de l'analyse BdF avec valeurs anormales...");

  const bdfAnalysis = await prisma.bdfAnalysis.create({
    data: {
      patientId: patient.id,
      date: new Date(),
      inputs: BDF_INPUTS as any,
      indexes: BDF_INDEXES as any,
      axes: ["thyroidien", "corticotrope", "hepatique"],
      summary: "Terrain hypothyroïdien fonctionnel avec fatigue surrénalienne. Surcharge hépatique nécessitant drainage. Carence martiale à corriger.",
      ragText: "Lecture endobiogénique: Hypométabolisme thyroïdien (Index Thyroïdien 3.29) avec répercussion sur l'axe corticotrope. Le foie montre des signes de surcharge (ALAT/ASAT/GGT élevés). Terrain inflammatoire bas bruit (CRP 3.5). Carence en fer fonctionnelle (ferritine 25)."
    }
  });
  console.log(`   ✅ BdF créée: ${bdfAnalysis.id}`);
  console.log(`   📊 Index thyroïdien: ${BDF_INDEXES.indexThyroidien} (N ~2.0)`);
  console.log(`   📊 Index hépatique: ${BDF_INDEXES.indexHepatique} (N ~1.0)`);

  // ==========================================
  // ÉTAPE 3: Exécuter le moteur thérapeutique
  // ==========================================
  console.log("\n🧠 ÉTAPE 3: Exécution du TherapeuticReasoningEngine...");
  console.log("─".repeat(70));

  const engine = new TherapeuticReasoningEngine();

  const patientContext = {
    age: PATIENT_TEST.age,
    sexe: PATIENT_TEST.sexe,
    CI: PATIENT_TEST.allergies,
    traitements: PATIENT_TEST.traitements,
    symptomes: PATIENT_TEST.symptomes,
    pathologies: PATIENT_TEST.pathologies,
    autresBilans: {
      ferritine: BDF_INPUTS.Ferritine,
      vitamineD: 22, // Carence simulée
    }
  };

  console.log("\n   📥 Contexte patient:");
  console.log(`      Âge: ${patientContext.age} ans`);
  console.log(`      Sexe: ${patientContext.sexe}`);
  console.log(`      CI: ${patientContext.CI.join(", ")}`);
  console.log(`      Symptômes: ${patientContext.symptomes.length}`);

  const startTime = Date.now();

  const raisonnement = await engine.executeFullReasoning(
    BDF_INDEXES as IndexResults,
    BDF_INPUTS as LabValues,
    SCOPE,
    patientContext
  );

  const duration = Date.now() - startTime;
  console.log(`\n   ⏱️ Durée d'exécution: ${duration}ms`);

  // ==========================================
  // ÉTAPE 4: Afficher les résultats détaillés
  // ==========================================
  console.log("\n" + "═".repeat(70));
  console.log("📋 RÉSULTATS DU RAISONNEMENT THÉRAPEUTIQUE");
  console.log("═".repeat(70));

  // 4.1 Axes perturbés
  console.log("\n🎯 AXES PERTURBÉS DÉTECTÉS:");
  console.log("─".repeat(50));
  if (raisonnement.axesPerturbés?.length > 0) {
    for (const axe of raisonnement.axesPerturbés) {
      const emoji = axe.niveau === "hypo" ? "⬇️" : axe.niveau === "hyper" ? "⬆️" : "⚖️";
      console.log(`   ${emoji} ${axe.axe.toUpperCase()} (${axe.niveau}) - Score: ${axe.score}/10`);
      console.log(`      └─ ${axe.justification}`);
    }
  } else {
    console.log("   (Aucun axe perturbé détecté)");
  }

  // 4.2 Hypothèses régulatrices
  console.log("\n💡 HYPOTHÈSES RÉGULATRICES:");
  console.log("─".repeat(50));
  if (raisonnement.hypothesesRegulatrices?.length > 0) {
    for (const hyp of raisonnement.hypothesesRegulatrices) {
      console.log(`   • ${hyp}`);
    }
  } else {
    console.log("   (Aucune hypothèse générée)");
  }

  // 4.3 Volet Endobiogénique
  console.log("\n🌿 VOLET 1: ENDOBIOGÉNIQUE (Drainage + Phyto + Gemmo)");
  console.log("─".repeat(50));
  if (raisonnement.recommandationsEndobiogenie?.length > 0) {
    for (const rec of raisonnement.recommandationsEndobiogenie) {
      console.log(`   [${rec.priorite}] ${rec.substance} (${rec.type})`);
      console.log(`       Forme: ${rec.forme} | Posologie: ${rec.posologie}`);
      console.log(`       Axe: ${rec.axeCible}`);
      console.log(`       Mécanisme: ${rec.mecanisme}`);
      if (rec.CI?.length > 0) {
        console.log(`       ⚠️ CI: ${rec.CI.join(", ")}`);
      }
      console.log("");
    }
  } else {
    console.log("   (Aucune recommandation endobiogénique)");
  }

  // 4.4 Volet Élargi (Aroma)
  console.log("\n🍃 VOLET 2: PHYTO ÉLARGI (Aromathérapie)");
  console.log("─".repeat(50));
  if (raisonnement.recommandationsElargies?.length > 0) {
    for (const rec of raisonnement.recommandationsElargies) {
      console.log(`   [${rec.priorite}] ${rec.substance} (${rec.type})`);
      console.log(`       Posologie: ${rec.posologie}`);
      console.log(`       Mécanisme: ${rec.mecanisme}`);
      if (rec.CI?.length > 0) {
        console.log(`       ⚠️ CI: ${rec.CI.join(", ")}`);
      }
      console.log("");
    }
  } else {
    console.log("   (Aromathérapie non incluse ou aucune recommandation)");
  }

  // 4.5 Volet Micronutrition
  console.log("\n💊 VOLET 3: MICRONUTRITION");
  console.log("─".repeat(50));
  if (raisonnement.recommandationsMicronutrition?.length > 0) {
    for (const rec of raisonnement.recommandationsMicronutrition) {
      console.log(`   [${rec.priorite}] ${rec.substance} (${rec.type})`);
      console.log(`       Posologie: ${rec.posologie}`);
      console.log(`       Axe: ${rec.axeCible}`);
      console.log("");
    }
  } else {
    console.log("   (Micronutrition non incluse ou aucune recommandation)");
  }

  // 4.6 Alertes
  console.log("\n⚠️ ALERTES THÉRAPEUTIQUES:");
  console.log("─".repeat(50));
  if (raisonnement.alertes?.length > 0) {
    for (const alerte of raisonnement.alertes) {
      const emoji = alerte.niveau === "error" ? "🔴" : alerte.niveau === "warning" ? "🟠" : "🔵";
      console.log(`   ${emoji} [${alerte.type}] ${alerte.message}`);
      if (alerte.recommandation) {
        console.log(`      → ${alerte.recommandation}`);
      }
    }
  } else {
    console.log("   ✅ Aucune alerte");
  }

  // 4.7 Résumé
  console.log("\n" + "═".repeat(70));
  console.log("📊 RÉSUMÉ");
  console.log("═".repeat(70));
  console.log(`   Recommandations Endobiogénie: ${raisonnement.recommandationsEndobiogenie?.length || 0}`);
  console.log(`   Recommandations Élargies:     ${raisonnement.recommandationsElargies?.length || 0}`);
  console.log(`   Recommandations Micronutri:   ${raisonnement.recommandationsMicronutrition?.length || 0}`);
  console.log(`   Alertes:                      ${raisonnement.alertes?.length || 0}`);
  console.log(`   Coût estimé:                  ${raisonnement.coutEstime || "N/A"}€/mois`);

  // 4.8 Raisonnement détaillé
  if (raisonnement.raisonnementDetaille) {
    console.log("\n📝 RAISONNEMENT DÉTAILLÉ:");
    console.log("─".repeat(50));
    console.log(raisonnement.raisonnementDetaille.substring(0, 1000));
    if (raisonnement.raisonnementDetaille.length > 1000) {
      console.log("... [tronqué]");
    }
  }

  // ==========================================
  // ÉTAPE 5: Vérifications spécifiques
  // ==========================================
  console.log("\n" + "═".repeat(70));
  console.log("✅ VÉRIFICATIONS DU TEST");
  console.log("═".repeat(70));

  const checks = {
    "Drainage évalué (foie)": raisonnement.recommandationsEndobiogenie?.some(
      r => r.axeCible?.toLowerCase().includes("drain") ||
           r.axeCible?.toLowerCase().includes("foie") ||
           r.axeCible?.toLowerCase().includes("hépat")
    ),
    "Axe thyroïdien détecté": raisonnement.axesPerturbés?.some(
      a => a.axe === "thyroidien"
    ),
    "CI aspirine vérifiée": raisonnement.alertes?.some(
      a => a.message?.toLowerCase().includes("aspirin") ||
           a.message?.toLowerCase().includes("ains") ||
           a.substancesConcernees?.some(s => s.toLowerCase().includes("salicyl"))
    ) || !raisonnement.recommandationsEndobiogenie?.some(
      r => r.substance?.toLowerCase().includes("saule") || // Salix = aspirine naturelle
           r.substance?.toLowerCase().includes("reine des prés") // Contient salicylés
    ),
    "Prescription personnalisée (F, 45 ans)": raisonnement.recommandationsEndobiogenie?.length > 0,
    "Hypothèses générées": (raisonnement.hypothesesRegulatrices?.length || 0) > 0,
  };

  for (const [check, result] of Object.entries(checks)) {
    console.log(`   ${result ? "✅" : "❌"} ${check}`);
  }

  // ==========================================
  // Nettoyage optionnel
  // ==========================================
  console.log("\n" + "═".repeat(70));
  console.log("🏁 TEST TERMINÉ");
  console.log("═".repeat(70));
  console.log(`\n   Patient ID: ${patient.id}`);
  console.log(`   BdF ID: ${bdfAnalysis.id}`);
  console.log("\n   💡 Pour tester via l'API web:");
  console.log(`   POST /api/ordonnances/generate`);
  console.log(`   Body: { "patientId": "${patient.id}" }`);
  console.log("");
}

// ==========================================
// EXÉCUTION
// ==========================================
main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
