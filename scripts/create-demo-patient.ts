/**
 * ============================================
 * SCRIPT DE CRÉATION DU PATIENT DÉMO POUR LE JURY
 * ============================================
 *
 * Ce script crée un patient complet avec :
 * - Informations personnelles
 * - Interrogatoire rempli sur tous les axes (12 axes)
 * - Valeurs BdF cohérentes
 *
 * Usage: npx tsx scripts/create-demo-patient.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// PROFIL DU PATIENT DÉMO
// ============================================
// Cas clinique : Femme 42 ans, stress chronique, fatigue, troubles du sommeil
// Terrain : Sympathicotonique Alpha dominant + Insuffisance corticotrope
// Objectif : Montrer un cas réaliste qui va générer des recommandations intéressantes

const DEMO_PATIENT = {
  // Informations de base
  numeroPatient: "DEMO-JURY-001",
  nom: "Ben Ali",
  prenom: "Fatima",
  dateNaissance: new Date("1982-06-15"), // 42 ans
  sexe: "F",
  telephone: "+216 98 123 456",
  email: "demo.patient@example.com",

  // Antécédents
  allergies: "Aucune allergie connue",
  atcdMedicaux: "Stress chronique depuis 3 ans, épisode de burnout il y a 18 mois, terrain anxieux familial",
  atcdChirurgicaux: "Appendicectomie à 15 ans",
  traitements: "Magnésium B6 (automédication), Mélatonine occasionnelle",

  // Contexte enrichi
  traitementActuel: "Magnésium B6 300mg/j, Mélatonine 1mg au coucher si insomnie",
  contreindicationsMajeures: [] as string[],
  pathologiesAssociees: ["Terrain anxieux", "Fatigue chronique"],
  symptomesActuels: [
    "Fatigue matinale intense",
    "Difficultés d'endormissement",
    "Réveils nocturnes (3h-4h)",
    "Coups de pompe à 11h et 17h",
    "Mains et pieds froids",
    "Irritabilité",
    "Ballonnements post-prandiaux"
  ],

  // Tags
  tags: ["Stress chronique", "Troubles du sommeil", "Fatigue", "Démo Jury"],

  // Consentement
  consentementRGPD: true,
  dateConsentement: new Date(),
};

// ============================================
// INTERROGATOIRE COMPLET (12 AXES)
// ============================================
// Réponses cohérentes avec le profil : Sympathicotonie Alpha + Insuffisance Corticotrope

const INTERROGATOIRE_COMPLET = {
  sexe: "F",
  answersByAxis: {
    // ==========================================
    // BLOC 1 : TERRAIN & HISTOIRE
    // ==========================================
    historique: {
      histo_atcd_familiaux: "Mère anxieuse traitée pour dépression, père hypertendu",
      histo_chocs_emotionnels: "Décès du père il y a 5 ans, divorce il y a 3 ans",
      histo_chirurgies: "Appendicectomie à 15 ans",
      histo_maladies_infantiles: "Varicelle, angines à répétition dans l'enfance",
      histo_vaccinations: "À jour",
      histo_age_premieres_regles: "12",
      histo_grossesses: "2 grossesses, 2 enfants",
    },

    modeVie: {
      vie_profession: "Cadre dans une entreprise, travail stressant",
      vie_activite_physique: 2, // Peu d'activité
      vie_alimentation: 3, // Moyenne, tendance à sauter le petit-déjeuner
      vie_hydratation: 2, // Insuffisante
      vie_alcool: 2, // Occasionnel (1-2 verres/semaine)
      vie_tabac: false,
      vie_cafe: 4, // 3-4 cafés par jour
      vie_sommeil_heures: "6", // Insuffisant
      vie_ecrans_soir: true,
      vie_stress_percu: 5, // Très élevé
    },

    // ==========================================
    // BLOC 2 : LES GESTIONNAIRES
    // ==========================================
    neuro: {
      // Parasympathique - modéré
      neuro_para_salivation: 2,
      neuro_para_nausee: 3, // Mal des transports modéré
      neuro_para_nez_bouche: 2,
      neuro_para_memoire: 4, // Rumine beaucoup

      // Sympathique Alpha - ÉLEVÉ (caractéristique du profil)
      neuro_alpha_froid: 5, // Mains/pieds très froids
      neuro_alpha_peau_seche: 4, // Peau sèche
      neuro_alpha_constipation: 4, // Constipation
      neuro_alpha_mental: 5, // Pensées qui tournent en boucle

      // Sympathique Beta - modéré
      neuro_beta_palpitations: 3,
      neuro_beta_emotivite: 4, // Hyper-émotive
      neuro_beta_tremblements: 2,
      neuro_beta_spasmes: 3,

      // Sommeil - PERTURBÉ
      neuro_sommeil_endormissement: 5, // Plus de 30 min
      neuro_reveil_nocturne: 4, // Réveils 3h-4h
      neuro_reveil_1h_3h: 4, // Réveils foie
      neuro_reves: 4, // Rêves vifs/cauchemars
    },

    adaptatif: {
      // Énergie & Rythme - INSUFFISANCE CORTICOTROPE
      cortico_fatigue_matin: 5, // Fatigue majeure au réveil
      cortico_coup_pompe: 5, // Coups de pompe 11h/17h
      cortico_endurance: 4, // Difficulté effort prolongé

      // Eau & Sel
      cortico_sel: 4, // Envies de sel
      cortico_hypotension: 3, // Vertiges orthostatiques modérés

      // Inflammation
      cortico_douleurs: 3, // Douleurs articulaires occasionnelles
      cortico_cicatrisation: 2,
      cortico_infections_recidivantes: 3, // Quelques infections ORL

      // Psychisme
      cortico_irritabilite: 4, // Irritable quand faim
      cortico_bruit: 4, // Hypersensibilité bruit/lumière

      // Chronobiologie
      cortico_aggravation_automne_hiver: 4, // Pire en hiver
      cortico_aggravation_printemps: 2,
      cortico_date_anniversaire: true, // Symptômes autour date décès père
    },

    thyro: {
      // Métabolisme - tendance hypo fonctionnelle
      thyro_metabolisme_general: 2, // Lent
      thyro_frilosite: true,
      thyro_sensation_froid_extremites: true,
      thyro_intolerance_chaleur: false,
      thyro_prise_poids_facile: true, // +5kg en 2 ans

      // Psychisme
      thyro_energie_mentale: 2, // Lente
      thyro_fatigue_matinale: true,
      thyro_ralentissement_general: true,
      thyro_difficultes_concentration: true,
      thyro_anxiete_agitation: true, // Paradoxal mais fréquent

      // Tissus
      thyro_peau_seche: true,
      thyro_chute_cheveux: "Oui modérée",
      thyro_ongles_fragiles: true,
      thyro_sourcils_externes: false,

      // Digestion
      thyro_transit_lent: true,
      thyro_digestion_lente: true,
      thyro_appetit_augmente: false,

      // Cardio
      thyro_tachycardie_repos: false,
      thyro_froid_apres_effort: true,
      thyro_pouls_lent: false,
    },

    gonado: {
      // Cycle - quelques perturbations
      gonado_regularite_cycle: 3, // Assez régulier
      gonado_duree_cycle: "28-32",
      gonado_abondance_regles: 3, // Normal
      gonado_douleurs_regles: 3, // Modérées
      gonado_spm: 4, // SPM marqué
      gonado_mastodynies: 3, // Tensions mammaires
      gonado_libido: 2, // Diminuée
      gonado_secheresse_vaginale: 2,
      gonado_bouffees_chaleur: 1, // Rares
    },

    somato: {
      // Croissance/Réparation
      somato_cicatrisation: 3, // Normale
      somato_recuperation_effort: 4, // Lente
      somato_douleurs_croissance: 1,
      somato_crampes: 3, // Quelques crampes nocturnes
      somato_fonte_musculaire: 2,
      somato_tendinites: 2,
    },

    // ==========================================
    // BLOC 3 : ÉMONCTOIRES & ORGANES
    // ==========================================
    digestif: {
      // Estomac
      dig_estomac_lourdeur: 3, // Lourdeur modérée
      dig_estomac_reflux: 2,
      dig_estomac_eructations: 2,

      // Foie & Pancréas - SOLLICITÉS
      dig_foie_graisses: 4, // Mal digéré les graisses
      dig_pancreas_somnolence: 4, // Coup de barre post-prandial
      dig_foie_reveil_nocturne: 4, // Réveils 1h-3h
      dig_foie_bouche_amere: 3,

      // Intestin & Microbiote
      dig_grele_ballonnement_immediat: 4, // Ballonnements immédiats
      dig_colon_ballonnement_tardif: 3,
      dig_douleurs_spasmes: 3,

      // Transit
      dig_transit_constipation: 4, // Constipation
      dig_transit_diarrhee: 1,
      dig_intolerances: 3, // Suspicion intolérances
    },

    immuno: {
      // ORL
      immuno_orl_infections: 3, // Quelques infections
      immuno_orl_sinusite: 2,
      immuno_orl_otites: 1,

      // Allergie - terrain modéré
      immuno_allergies_respiratoires: 2,
      immuno_allergies_cutanees: 2,
      immuno_allergies_alimentaires: 2,

      // Auto-immunité
      immuno_auto_immun: 1, // Pas de pathologie AI
      immuno_inflammation_chronique: 3, // Légère inflammation bas grade
    },

    cardioMetabo: {
      // Cardio
      cardio_palpitations: 3,
      cardio_essoufflement: 2,
      cardio_douleurs_thoraciques: 1,
      cardio_jambes_lourdes: 3, // Modéré
      cardio_varices: 2,

      // Tension
      cardio_hypertension: 1, // Plutôt hypotension
      cardio_hypotension: 3,

      // Métabo
      metabo_glycemie: 3, // Hypoglycémies réactionnelles
      metabo_cholesterol: 2,
      metabo_triglycerides: 2,
    },

    dermato: {
      // Peau
      dermato_peau_seche: 4, // Très sèche
      dermato_peau_grasse: 1,
      dermato_acne: 1,
      dermato_eczema: 2,
      dermato_psoriasis: 1,
      dermato_urticaire: 2,

      // Phanères
      dermato_cheveux_secs: 4,
      dermato_cheveux_gras: 1,
      dermato_chute_cheveux: 3,
      dermato_ongles_cassants: 4,
      dermato_ongles_stries: 3,
    },

    terrains: {
      // Terrains pathologiques identifiés
      terrain_spasmophile: 4, // MARQUÉ
      terrain_atopique: 2,
      terrain_auto_immun: 1,
      terrain_congestif: 3,
      terrain_metabolique: 2,
      terrain_degeneratif: 1,
    },
  },
};

// ============================================
// VALEURS BDF (BIOLOGIE DES FONCTIONS)
// ============================================
// Valeurs cohérentes avec le profil clinique

const BDF_INPUTS = {
  // Hématologie
  GR: 4.2,        // Millions/µL - légèrement bas (tendance œstrogénique)
  GB: 7.5,        // Milliers/µL - normal
  HB: 12.8,       // g/dL - limite basse normale
  HT: 38,         // % - limite basse
  VGM: 88,        // fL - normal
  TCMH: 30,       // pg - normal
  CCMH: 33,       // g/dL - normal

  // Formule leucocytaire
  NEUT: 58,       // % - normal haut (légère tendance inflammatoire)
  LYMPH: 30,      // % - normal bas
  MONO: 8,        // % - normal haut
  EOS: 2,         // % - normal bas (cortisol insuffisant)
  BASO: 1,        // % - normal

  // Plaquettes
  PLAQUETTES: 245, // Milliers/µL - normal

  // Enzymes
  LDH: 165,       // U/L - normal
  CPK: 85,        // U/L - normal

  // Transaminases
  ALAT: 28,       // U/L - normal
  ASAT: 24,       // U/L - normal
  GGT: 32,        // U/L - légèrement élevé (surcharge hépatique)

  // Thyroïde
  TSH: 2.8,       // mUI/L - normal haut (compensation)
  T4L: 1.1,       // ng/dL - normal bas
  T3L: 2.5,       // pg/mL - normal bas (défaut conversion)

  // Ionogramme
  NA: 140,        // mEq/L - normal
  K: 4.2,         // mEq/L - normal
  CA: 9.2,        // mg/dL - normal
  P: 3.5,         // mg/dL - normal
  MG: 1.8,        // mg/dL - limite basse (carence magnésium)

  // Marqueurs osseux (optionnels mais utiles)
  PAOI: 65,       // U/L - normal
  OSTEO: 18,      // ng/mL - normal

  // Lipides
  CHOL: 210,      // mg/dL - légèrement élevé
  TG: 95,         // mg/dL - normal
  HDL: 55,        // mg/dL - normal
  LDL: 138,       // mg/dL - légèrement élevé

  // Glycémie
  GLY: 92,        // mg/dL - normal haut (tendance insulino-résistance)
  HBA1C: 5.4,     // % - normal

  // Inflammation
  CRP: 3.5,       // mg/L - légèrement élevée (inflammation bas grade)
  VS: 15,         // mm/h - normal haut

  // Fer
  FER: 65,        // µg/dL - normal bas
  FERRITINE: 35,  // ng/mL - limite basse
  TRANSFERRINE: 280, // mg/dL - normal
};

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function createDemoPatient() {
  console.log("🚀 Création du patient de démo pour le jury...\n");

  try {
    // 1. Vérifier si le patient existe déjà
    const existingPatient = await prisma.patient.findUnique({
      where: { numeroPatient: DEMO_PATIENT.numeroPatient },
    });

    if (existingPatient) {
      console.log("⚠️  Le patient DEMO-JURY-001 existe déjà.");
      console.log("   ID:", existingPatient.id);
      console.log("   Voulez-vous le supprimer et le recréer ? (suppression manuelle requise)");

      // Option: Mettre à jour au lieu de recréer
      const updatedPatient = await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          ...DEMO_PATIENT,
          interrogatoire: INTERROGATOIRE_COMPLET,
          autresBilans: BDF_INPUTS,
        },
      });

      console.log("\n✅ Patient mis à jour avec succès!");
      console.log("   ID:", updatedPatient.id);
      return updatedPatient;
    }

    // 2. Trouver un utilisateur pour associer le patient
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      console.error("❌ Aucun utilisateur trouvé. Créez d'abord un compte.");
      return null;
    }

    console.log("👤 Utilisateur trouvé:", user.email);

    // 3. Créer le patient
    const patient = await prisma.patient.create({
      data: {
        ...DEMO_PATIENT,
        userId: user.id,
        interrogatoire: INTERROGATOIRE_COMPLET,
        autresBilans: BDF_INPUTS,
      },
    });

    console.log("\n✅ Patient créé avec succès!");
    console.log("   ID:", patient.id);
    console.log("   Numéro:", patient.numeroPatient);
    console.log("   Nom:", patient.prenom, patient.nom);

    // 4. Créer une analyse BdF
    console.log("\n📊 Création de l'analyse BdF...");

    const bdfAnalysis = await prisma.bdfAnalysis.create({
      data: {
        patientId: patient.id,
        date: new Date(),
        inputs: BDF_INPUTS,
        indexes: [], // Sera calculé par le frontend
        summary: "Analyse en attente de calcul des index",
        axes: [],
      },
    });

    console.log("   Analyse BdF créée, ID:", bdfAnalysis.id);

    // 5. Résumé final
    console.log("\n" + "=".repeat(50));
    console.log("📋 RÉSUMÉ DU PATIENT DÉMO");
    console.log("=".repeat(50));
    console.log(`
Patient: ${patient.prenom} ${patient.nom}
Numéro: ${patient.numeroPatient}
Âge: 42 ans
Sexe: Femme

Profil clinique:
- Stress chronique (3 ans)
- Épisode de burnout (18 mois)
- Terrain anxieux familial
- Sympathicotonie Alpha dominante
- Insuffisance corticotrope fonctionnelle

Symptômes principaux:
- Fatigue matinale intense
- Troubles du sommeil (endormissement + réveils 3h)
- Mains/pieds froids
- Constipation
- Ballonnements
- Irritabilité

Index attendus (à calculer):
- Index Génital: ~0.56 (tendance œstrogénique)
- Index d'Adaptation: ~0.25 (bas = insuffisance corticotrope)
- Index Thyroïdien: ~1.94 (bas = hypofonction)
- Index Starter: devrait révéler spasmophilie

Axes à traiter en priorité:
1. Axe Corticotrope (surrénales)
2. Drainage hépatique
3. SNA (sympatholytiques alpha)
4. Axe Thyréotrope (soutien)
`);

    console.log("=".repeat(50));
    console.log("✅ Patient prêt pour la démo!");
    console.log("=".repeat(50));

    return patient;

  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution
createDemoPatient()
  .then(() => {
    console.log("\n🎬 Vous pouvez maintenant lancer la démo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
  });
