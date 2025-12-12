// ========================================
// SCRIPT : Création de 3 patients de test
// ========================================
// Usage: npx tsx scripts/create-test-patients.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Email du compte utilisateur
const USER_EMAIL = "amine.benayed@live.fr";

// ========================================
// PROFILS DE TEST VARIÉS - FORMAT V2
// ========================================

const PATIENTS_TEST = [
  {
    // TEST 1 : Homme 45 ans, stress chronique, hypothyroïdie fonctionnelle
    numeroPatient: "TEST-001",
    nom: "Test1",
    prenom: "Patient",
    dateNaissance: new Date("1979-03-15"),
    sexe: "H",
    allergies: "Aucune allergie connue",
    atcdMedicaux: "Stress professionnel chronique, fatigue persistante depuis 2 ans",
    traitementActuel: "Magnésium 300mg/j",
    symptomesActuels: ["Fatigue matinale", "Difficultés de concentration", "Frilosité", "Prise de poids récente"],
    pathologiesAssociees: ["Hypothyroïdie subclinique"],
    contreindicationsMajeures: [],
    // BdF : Profil hypothyroïdien + épuisement surrénalien
    bdfInputs: {
      GR: 4.2,
      GB: 5.8,
      NEUT: 55,
      LYMPH: 35,
      MONO: 6,
      EOS: 3,
      BASO: 1,
      PLT: 220,
      LDH: 145,
      CPK: 85,
      TSH: 4.2,
      PAOi: 42,
      Ca: 2.35,
      OSTEO: 18,
      Na: 140,
      K: 4.2,
    },
    // Interrogatoire V2 : Format answersByAxis
    interrogatoire: {
      sexe: "H",
      v2: {
        sexe: "H",
        answersByAxis: {
          historique: {
            hist_chocs_emotionnels: "Burnout professionnel il y a 3 ans",
            hist_chirurgies: "Appendicectomie à 12 ans",
            hist_antecedents_familiaux: "Père diabétique, mère hypothyroïdienne",
          },
          modeVie: {
            vie_alimentation_type: "Standard avec fast-food 2x/semaine",
            vie_alcool: 2,
            vie_tabac: 0,
            vie_cafe: 4,
            vie_activite_physique: 1,
          },
          neuro: {
            neuro_para_salivation: 2,
            neuro_para_nausee: 1,
            neuro_alpha_froid: 4, // Mains et pieds froids +++
            neuro_alpha_peau_seche: 3,
            neuro_beta_palpitations: 2,
            neuro_sommeil_qualite: 2, // Mauvais sommeil
            neuro_sommeil_reveil_nocturne: 4, // Réveils fréquents
          },
          adaptatif: {
            adapt_stress_niveau: 5, // Stress maximal
            adapt_stress_duree: "Plus de 6 mois",
            adapt_recuperation: 1, // Mauvaise récupération
            adapt_anxiete: 4,
            adapt_irritabilite: 4,
            adapt_capacite_adaptation: 2,
          },
          thyro: {
            thyro_frilosite: 5, // Très frileux
            thyro_fatigue_matin: 5, // Épuisé le matin
            thyro_prise_poids: 4,
            thyro_constipation: 3,
            thyro_peau_seche: 4,
            thyro_cheveux_cassants: 3,
            thyro_moral_bas: 3,
          },
          gonado: {
            gonado_libido: 2, // Libido diminuée
            gonado_erection: 3, // Difficultés occasionnelles
          },
          somato: {
            somato_cicatrisation: 3,
            somato_recuperation_effort: 2,
          },
          digestif: {
            digest_ballonnements: 3,
            digest_transit: "Constipation",
            digest_reflux: 2,
          },
          immuno: {
            immuno_infections_frequentes: 3,
            immuno_allergies: 1,
          },
          cardioMetabo: {
            cardio_tension: "Normale",
            cardio_dyspnee: 2,
          },
          dermato: {
            dermato_peau_seche: 4,
            dermato_cheveux_chute: 3,
          },
          terrains: {
            terrain_spasmophile: 3,
            terrain_depressif: 3,
          },
        },
      },
    },
  },
  {
    // TEST 2 : Femme 38 ans, SPM, hyperœstrogénie relative
    numeroPatient: "TEST-002",
    nom: "Test2",
    prenom: "Patiente",
    dateNaissance: new Date("1986-07-22"),
    sexe: "F",
    allergies: "Pénicilline",
    atcdMedicaux: "SPM sévère depuis 5 ans, mastodynies cycliques",
    traitementActuel: "Gattilier 400mg/j, Onagre 1g/j",
    symptomesActuels: ["Mastodynies prémenstruelles", "Irritabilité cyclique", "Rétention d'eau", "Migraines cataméniales"],
    pathologiesAssociees: ["Syndrome prémenstruel", "Mastose fibrokystique"],
    contreindicationsMajeures: ["Grossesse possible"],
    // BdF : Profil hyperœstrogénique
    bdfInputs: {
      GR: 4.5,
      GB: 6.2,
      NEUT: 58,
      LYMPH: 32,
      MONO: 7,
      EOS: 2,
      BASO: 1,
      PLT: 280,
      LDH: 165,
      CPK: 95,
      TSH: 2.1,
      PAOi: 55,
      Ca: 2.42,
      OSTEO: 22,
      Na: 138,
      K: 3.9,
    },
    // Interrogatoire V2 : Profil SPM hyperœstrogénique
    interrogatoire: {
      sexe: "F",
      v2: {
        sexe: "F",
        answersByAxis: {
          historique: {
            hist_chocs_emotionnels: "Divorce difficile il y a 2 ans",
            hist_chirurgies: "Aucune",
            hist_antecedents_familiaux: "Mère avec endométriose, grand-mère cancer sein",
          },
          modeVie: {
            vie_alimentation_type: "Végétarienne, tendance sucrée",
            vie_alcool: 1,
            vie_tabac: 0,
            vie_cafe: 2,
            vie_activite_physique: 3,
          },
          neuro: {
            neuro_para_salivation: 3,
            neuro_para_nausee: 4, // Nausées fréquentes
            neuro_alpha_froid: 2,
            neuro_beta_palpitations: 3,
            neuro_sommeil_qualite: 3,
            neuro_sommeil_reveil_nocturne: 3,
          },
          adaptatif: {
            adapt_stress_niveau: 3,
            adapt_stress_duree: "Variable selon le cycle",
            adapt_recuperation: 3,
            adapt_anxiete: 4, // Anxiété prémenstruelle
            adapt_irritabilite: 5, // Très irritable en SPM
            adapt_capacite_adaptation: 3,
          },
          thyro: {
            thyro_frilosite: 2,
            thyro_fatigue_matin: 3,
            thyro_prise_poids: 3, // Prise de poids cyclique
            thyro_constipation: 2,
            thyro_moral_bas: 4, // Baisse moral prémenstruelle
          },
          gonado: {
            gonado_cycles_reguliers: true,
            gonado_duree_cycle: 28,
            gonado_regles_abondantes: 4, // Règles abondantes
            gonado_regles_douloureuses: 4, // Dysménorrhée
            gonado_spm_intensite: 5, // SPM sévère
            gonado_mastodynies: 5, // Seins très douloureux
            gonado_migraines_cataméniales: 4,
            gonado_libido: 3,
            gonado_pertes_blanches: 4, // Leucorrhées abondantes
            gonado_retention_eau: 5, // Rétention d'eau importante
          },
          somato: {
            somato_cicatrisation: 4,
            somato_recuperation_effort: 3,
          },
          digestif: {
            digest_ballonnements: 5, // Ballonnements +++
            digest_transit: "Variable selon le cycle",
            digest_nausees: 3,
          },
          immuno: {
            immuno_infections_frequentes: 2,
            immuno_mycoses: 4, // Mycoses récidivantes
          },
          cardioMetabo: {
            cardio_tension: "Basse",
            cardio_oedemes: 4, // Œdèmes prémenstruels
          },
          dermato: {
            dermato_acne: 3, // Acné cyclique
            dermato_peau_grasse: 3,
          },
          terrains: {
            terrain_congestif: 4,
            terrain_spasmophile: 3,
          },
        },
      },
    },
  },
  {
    // TEST 3 : Homme 62 ans, HBP, terrain inflammatoire
    numeroPatient: "TEST-003",
    nom: "Test3",
    prenom: "Patient",
    dateNaissance: new Date("1962-11-08"),
    sexe: "H",
    allergies: "Aspirine",
    atcdMedicaux: "HTA traitée, HBP stade 2, arthrose cervicale",
    traitementActuel: "Amlodipine 5mg/j, Tamsulosine 0.4mg/j",
    symptomesActuels: ["Pollakiurie nocturne", "Jet urinaire faible", "Douleurs articulaires", "Raideur matinale"],
    pathologiesAssociees: ["Hypertrophie bénigne prostate", "HTA", "Arthrose"],
    contreindicationsMajeures: ["HTA", "Saignements (aspirine)"],
    // BdF : Profil inflammatoire + androgénique
    bdfInputs: {
      GR: 4.8,
      GB: 7.5,
      NEUT: 65,
      LYMPH: 25,
      MONO: 8,
      EOS: 1,
      BASO: 1,
      PLT: 195,
      LDH: 195,
      CPK: 120,
      TSH: 1.8,
      PAOi: 68,
      Ca: 2.48,
      OSTEO: 28,
      Na: 142,
      K: 4.5,
    },
    // Interrogatoire V2 : Profil HBP + inflammatoire
    interrogatoire: {
      sexe: "H",
      v2: {
        sexe: "H",
        answersByAxis: {
          historique: {
            hist_chocs_emotionnels: "Retraite difficile il y a 1 an",
            hist_chirurgies: "Hernie inguinale à 45 ans",
            hist_antecedents_familiaux: "Père cancer prostate, mère AVC",
          },
          modeVie: {
            vie_alimentation_type: "Riche en viandes rouges et charcuterie",
            vie_alcool: 3, // Vin quotidien
            vie_tabac: 0, // Ex-fumeur
            vie_cafe: 3,
            vie_activite_physique: 2,
          },
          neuro: {
            neuro_para_salivation: 2,
            neuro_para_nausee: 1,
            neuro_alpha_froid: 2,
            neuro_alpha_peau_seche: 2,
            neuro_beta_palpitations: 2,
            neuro_sommeil_qualite: 2, // Mauvais (réveils pour uriner)
            neuro_sommeil_reveil_nocturne: 5, // 3+ réveils nocturnes
          },
          adaptatif: {
            adapt_stress_niveau: 2,
            adapt_recuperation: 2,
            adapt_anxiete: 2,
            adapt_irritabilite: 3,
            adapt_capacite_adaptation: 3,
          },
          thyro: {
            thyro_frilosite: 1,
            thyro_fatigue_matin: 3,
            thyro_prise_poids: 3,
            thyro_constipation: 2,
            thyro_moral_bas: 2,
          },
          gonado: {
            gonado_libido: 2, // Diminuée
            gonado_erection: 2, // Difficultés
            gonado_pollakiurie: 5, // Fréquence urinaire +++
            gonado_nycturie: 5, // 3+ levers nocturnes
            gonado_jet_faible: 5, // Jet très faible
            gonado_dysurie: 4, // Difficulté à démarrer
            gonado_gouttes_retardataires: 4,
          },
          somato: {
            somato_cicatrisation: 3,
            somato_recuperation_effort: 2,
            somato_raideur_matinale: 5, // Raideur importante
          },
          digestif: {
            digest_ballonnements: 2,
            digest_transit: "Normal",
            digest_reflux: 3,
          },
          immuno: {
            immuno_inflammation_chronique: 5, // Terrain inflammatoire
            immuno_douleurs_articulaires: 5, // Arthrose
            immuno_raideur_articulaire: 5,
          },
          cardioMetabo: {
            cardio_tension: "HTA traitée",
            cardio_dyspnee: 3, // Légère dyspnée d'effort
            cardio_surpoids: 4,
          },
          dermato: {
            dermato_peau_seche: 2,
          },
          terrains: {
            terrain_inflammatoire: 5,
            terrain_congestif: 4,
            terrain_metabolique: 4,
          },
        },
      },
    },
  },
];

async function main() {
  console.log("🔍 Recherche de l'utilisateur:", USER_EMAIL);

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
  });

  if (!user) {
    console.error("❌ Utilisateur non trouvé:", USER_EMAIL);
    process.exit(1);
  }

  console.log("✅ Utilisateur trouvé:", user.id);

  // Créer les 3 patients
  for (const patientData of PATIENTS_TEST) {
    console.log(`\n📝 Création patient: ${patientData.prenom} ${patientData.nom}`);

    // Vérifier si existe déjà
    const existing = await prisma.patient.findUnique({
      where: { numeroPatient: patientData.numeroPatient },
    });

    if (existing) {
      console.log(`⚠️ Patient ${patientData.numeroPatient} existe déjà, suppression...`);
      await prisma.patient.delete({ where: { id: existing.id } });
    }

    // Créer le patient avec interrogatoire V2
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        numeroPatient: patientData.numeroPatient,
        nom: patientData.nom,
        prenom: patientData.prenom,
        dateNaissance: patientData.dateNaissance,
        sexe: patientData.sexe,
        allergies: patientData.allergies,
        atcdMedicaux: patientData.atcdMedicaux,
        traitementActuel: patientData.traitementActuel,
        symptomesActuels: patientData.symptomesActuels,
        pathologiesAssociees: patientData.pathologiesAssociees,
        contreindicationsMajeures: patientData.contreindicationsMajeures,
        interrogatoire: patientData.interrogatoire,
        consentementRGPD: true,
        dateConsentement: new Date(),
      },
    });

    console.log(`✅ Patient créé: ${patient.id}`);

    // Créer l'analyse BdF
    const bdfAnalysis = await prisma.bdfAnalysis.create({
      data: {
        patientId: patient.id,
        inputs: patientData.bdfInputs,
        indexes: [], // Sera calculé par l'API
        summary: "Analyse BdF en attente de calcul",
        axes: [],
      },
    });

    console.log(`✅ Analyse BdF créée: ${bdfAnalysis.id}`);

    // Créer anthropométrie de base
    await prisma.anthropometrie.create({
      data: {
        patientId: patient.id,
        poids: patientData.sexe === "H" ? 78 : 62,
        taille: patientData.sexe === "H" ? 175 : 165,
        imc: patientData.sexe === "H" ? 25.5 : 22.8,
        paSys: patientData.numeroPatient === "TEST-003" ? 145 : 125,
        paDia: patientData.numeroPatient === "TEST-003" ? 92 : 78,
        pouls: 72,
      },
    });

    console.log(`✅ Anthropométrie créée`);

    // Compter les réponses
    const answersByAxis = patientData.interrogatoire.v2.answersByAxis;
    let totalResponses = 0;
    for (const axisKey of Object.keys(answersByAxis)) {
      const axisAnswers = answersByAxis[axisKey as keyof typeof answersByAxis];
      if (axisAnswers && typeof axisAnswers === "object") {
        totalResponses += Object.keys(axisAnswers).length;
      }
    }
    console.log(`✅ Interrogatoire V2 créé avec ${totalResponses} réponses`);
  }

  console.log("\n========================================");
  console.log("✅ 3 PATIENTS DE TEST CRÉÉS AVEC SUCCÈS");
  console.log("========================================");
  console.log("- TEST-001: Homme 45 ans, hypothyroïdie + épuisement (format V2)");
  console.log("- TEST-002: Femme 38 ans, SPM + hyperœstrogénie (format V2)");
  console.log("- TEST-003: Homme 62 ans, HBP + inflammation (format V2)");
  console.log("\nConnectez-vous et allez dans l'onglet Patients pour les voir.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
