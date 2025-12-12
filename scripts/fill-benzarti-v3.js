const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script V3 FINAL - Options EXACTES vérifiées dans chaque config
 */

async function main() {
  console.log('🔍 Recherche de la patiente BENZARTI Sonia...');

  const patient = await prisma.patient.findFirst({
    where: { nom: 'BENZARTI', prenom: 'Sonia' }
  });

  if (!patient) {
    console.log('❌ Patiente non trouvée!');
    return;
  }

  console.log('✅ Patiente trouvée:', patient.numeroPatient);

  const interrogatoireV2 = {
    sexe: "F",
    v2: {
      answersByAxis: {
        // ═══════════════════════════════════════════════════
        // HISTORIQUE - vérifié
        // ═══════════════════════════════════════════════════
        historique: {
          hist_traumatisme_enfance: 3,
          hist_maltraitance: false,
          hist_alcoolisme_parents: false,
          hist_deces_parent_enfance: true,
          hist_abandon_negligence: false,
          hist_divorce_parents: false,
          hist_maladies_recurrentes_enfance: 3,
          hist_amygdalectomie_vegetations: true,
          hist_eczema_asthme_enfance: true,
          hist_convulsions_febriles: false,
          hist_croissance_precoce_tardive: "Normale",
          hist_maladies_infantiles: true,
          hist_developpement_psychomoteur: false,
          hist_temperament_enfance: "Anxieux ou craintif",
          hist_alimentation_enfance: true,
          hist_antecedents_cancer_famille: true,
          hist_maladies_autoimmunes_famille: true,
          hist_cardiovasculaire_famille: true,
          hist_diabete_famille: true,
          hist_psychiatrique_famille: true,
          hist_thyroide_famille: true,
          hist_neurologique_famille: false,
          hist_chirurgies_majeures: 2,
          hist_hospitalisations: false,
          hist_maladies_chroniques: false,
          hist_naissance_prematuree: "Naissance normale à terme",
          hist_grossesse_mere_difficile: true,
          hist_accouchement_difficile: false,
          hist_allaitement: "3-6 mois",
          hist_antibiotiques_enfance: 3,
          hist_vaccinations_reactions: false,
          hist_traitements_hormonaux: 4,
          hist_psychotropes: false,
          hist_expositions_toxiques: false,
          hist_stress_chronique_vie: 4,
          hist_deuil_majeur: true,
          hist_accidents_graves: false,
          hist_rupture_relation_majeure: true,
          hist_pause_genitale_symptomes: true,
          hist_menopause_andropause: 4,
          hist_changement_personnalite: true,
          hist_periode_hyperfonctionnement: true,
          hist_periode_hypofonctionnement: true,
          hist_resilience: 2
        },

        // ═══════════════════════════════════════════════════
        // MODE DE VIE - OPTIONS EXACTES de axe-mode-de-vie.ts
        // ═══════════════════════════════════════════════════
        modeVie: {
          // SCALE 1-5: ["Très mauvaise", "Mauvaise", "Moyenne", "Bonne", "Excellente"]
          vie_sommeil_qualite: 2,
          // SELECT: ["Avant 22h", "22h-23h", "23h-minuit", "Après minuit", "Variable/irrégulier"]
          vie_sommeil_heure_coucher: "23h-minuit",
          // SELECT: ["Moins de 5h", "5-6h", "6-7h", "7-8h", "Plus de 8h"]
          vie_sommeil_duree: "5-6h",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"]
          vie_sommeil_endormissement: "Souvent",
          vie_sommeil_reveils: "Souvent",
          // SELECT: ["Pas de souvenirs", "Rêves calmes occasionnels", "Rêves fréquents et calmes", "Rêves vifs et agités", "Cauchemars fréquents"]
          vie_sommeil_reves: "Rêves vifs et agités",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"]
          vie_sommeil_reveil_fatigue: "Souvent",
          // SCALE 1-5: ["Très déséquilibrée", "Déséquilibrée", "Moyenne", "Équilibrée", "Très équilibrée"]
          vie_alimentation_equilibre: 2,
          // SELECT: ["1 repas", "2 repas", "3 repas", "Plus de 3 repas", "Grignotage fréquent"]
          vie_alimentation_repas: "2 repas",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"]
          vie_envies_sucre: "Souvent",
          // SELECT: ["Jamais", "Rarement", "Modérément", "Souvent", "Quotidiennement"]
          vie_alimentation_laitages: "Quotidiennement",
          vie_alimentation_gluten: "Quotidiennement",
          // SELECT: ["Très peu", "Peu", "Modérément", "Assez", "Beaucoup"]
          vie_alimentation_fibres: "Peu",
          // SELECT: ["Très peu (<0.5L)", "Peu (0.5-1L)", "Modérément (1-1.5L)", "Suffisamment (1.5-2L)", "Beaucoup (>2L)"]
          vie_hydratation: "Peu (0.5-1L)",
          // SELECT: ["Jamais", "Rarement (<1x/semaine)", "1-2x/semaine", "3-4x/semaine", "Quotidiennement"]
          vie_exercice_frequence: "Jamais",
          // SELECT: ["Aucun", "Marche légère", "Cardio (jogging, natation)", "Musculation", "Yoga/Tai Chi/Qi Gong", "Mixte"]
          vie_exercice_type: "Aucun",
          // SELECT: ["Non", "Rarement", "Parfois", "Souvent", "Régulièrement"]
          vie_exercice_exces: "Non",
          // SELECT: ["Non", "Parfois", "Souvent", "Quotidiennement"]
          vie_sedentarite: "Quotidiennement",
          // SELECT: ["Jamais fumé", "Ex-fumeur (>5 ans)", "Ex-fumeur (<5 ans)", "Fumeur occasionnel", "Fumeur quotidien"]
          vie_tabac: "Jamais fumé",
          // SELECT: ["Jamais", "Occasionnel (social)", "1-2 verres/jour", "3-4 verres/jour", "Plus de 4 verres/jour"]
          vie_alcool: "Occasionnel (social)",
          // SELECT: ["Aucun", "1-2 cafés", "3-4 cafés", "Plus de 4 cafés"]
          vie_cafe: "3-4 cafés",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"]
          vie_ecrans_soir: "Toujours",
          // SELECT: ["Aucun", "Léger", "Modéré", "Important", "Très important"]
          vie_stress_chronique: "Très important",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"]
          vie_colere: "Parfois",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Constamment"]
          vie_anxiete: "Souvent",
          // SELECT: ["Jamais", "Rarement", "Occasionnellement", "Régulièrement", "Quotidiennement"]
          vie_relaxation: "Jamais",
          // SCALE 1-5: ["Pas du tout", "Peu", "Moyennement", "Assez", "Très satisfait"]
          vie_satisfaction_professionnelle: 2,
          // SELECT: ["Très irréguliers", "Irréguliers", "Variables", "Assez réguliers", "Très réguliers"]
          vie_horaires_reguliers: "Irréguliers",
          // SELECT: ["Jamais", "Rarement", "Occasionnellement", "Régulièrement (courtes)", "Régulièrement (longues >1h)"]
          vie_sieste: "Occasionnellement",
          // SELECT: ["Pas du tout", "Peu", "Modérément", "Assez", "Très sensible"]
          vie_saison_sensible: "Assez",
          // SELECT: ["Non", "Rarement (1-2x/an)", "Occasionnellement (3-5x/an)", "Fréquemment (>5x/an)"]
          vie_jet_lag: "Non"
        },

        // ═══════════════════════════════════════════════════
        // TERRAINS - OPTIONS EXACTES de axe-terrains-pathologiques.ts
        // ═══════════════════════════════════════════════════
        terrains: {
          // SELECT: ["Calme, posé, introverti (Vagotonique)", "Anxieux, sensible, émotif (Alpha)", "Énergique, actif, extraverti (Bêta)", "Irritable, variable, difficile à calmer (Spasmophile)", "Variable selon les périodes"]
          terr_temperament_global: "Anxieux, sensible, émotif (Alpha)",
          // SELECT: ["Très bien, longtemps (Vagotonique)", "Difficulté à se calmer, réveils fréquents (Alpha)", "Agité, enlevait les couvertures (Bêta)", "Habitudes irrégulières (Spasmophile)", "Ne sait pas"]
          terr_sommeil_enfance: "Difficulté à se calmer, réveils fréquents (Alpha)",
          // SELECT: ["Selles fréquentes et molles (Vagotonique)", "Constipé, selles dures (Alpha)", "Défécation fréquente ou rapide (Bêta)", "Coliques, consistance/fréquence irrégulière (Spasmophile)", "Ne sait pas"]
          terr_comportement_intestinal: "Coliques, consistance/fréquence irrégulière (Spasmophile)",
          // SCALE 1-5
          terr_vagotonie: 3,
          terr_sympathicotonie: 4,
          terr_spasmophilie: 4,
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"]
          terr_attaques_panique: "Parfois",
          terr_lipothymie: "Rarement",
          terr_paresthesies: "Parfois",
          terr_spasmes_digestifs: "Souvent",
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Chroniquement"]
          terr_infections_recidivantes: "Souvent",
          // SCALE 1-5
          terr_inflammation_chronique: 3,
          terr_congestion_hepatique: 3,
          terr_congestion_pelvienne: 3,
          terr_dysbiose: 4,
          // SELECT: ["Non", "Thyroïdite (Hashimoto, Basedow)", "Polyarthrite rhumatoïde", "MICI (Crohn, RCH)", "Sclérose en plaques", "Autre maladie auto-immune"]
          terr_auto_immun: "Non",
          // SELECT: ["Aucune", "1-2 allergies", "3-5 allergies", "Nombreuses", "Très nombreuses"]
          terr_allergies_multiples: "3-5 allergies",
          // SELECT: ["Non", "Eczéma", "Psoriasis", "Les deux", "Antécédent guéri"]
          terr_eczema_psoriasis: "Eczéma",
          // SELECT: ["Non", "Asthme allergique (extrinsèque)", "Asthme non allergique (intrinsèque)", "Les deux", "Antécédent guéri"]
          terr_asthme: "Non",
          // SELECT: ["Non", "Fibromes utérins", "Kystes (ovariens, mammaires, autres)", "Polypes (intestinaux, nasaux)", "Adénome prostatique", "Plusieurs types"]
          terr_tumeurs_benignes: "Non",
          // BOOLEAN
          terr_cancer_personnel: false,
          // SELECT: ["Non", "1 cas", "2-3 cas", "Plus de 3 cas", "Syndrome familial connu"]
          terr_cancer_familial: "2-3 cas",
          // BOOLEAN
          terr_verrues_molluscum: false,
          // SCALE 1-5
          terr_degeneratif: 2,
          // BOOLEAN
          terr_calcifications: false,
          terr_sclerose: false,
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Constamment"]
          terr_fatigue_adaptative: "Souvent",
          // SCALE 1-5
          terr_sensibilite_stress: 5,
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"]
          terr_recuperation_lente: "Souvent",
          // SELECT: ["Non", "Printemps (allergies, relance thyréotrope)", "Automne (bronchites, préparation hivernale)", "Hiver (dépression, fatigue)", "Été", "Transitions saisonnières"]
          terr_aggravation_saisonniere: "Automne (bronchites, préparation hivernale)",
          // SELECT: ["Pas de terrain particulier", "Cardiovasculaire (HTA, infarctus, AVC)", "Métabolique (diabète, obésité)", "Auto-immun (thyroïdite, PR, MICI)", "Allergique/Atopique (asthme, eczéma)", "Psychiatrique (dépression, anxiété)", "Tumoral (cancers multiples)"]
          terr_terrain_familial: "Cardiovasculaire (HTA, infarctus, AVC)",
          // BOOLEAN
          terr_maladies_meme_famille: true,
          // SELECT: ["Non concerné", "Non", "Oui (1 cas)", "Oui (plusieurs cas)"]
          terr_endometriose_famille: "Non",
          // SCALE 1-5
          terr_resistance_insuline: 3,
          // BOOLEAN
          terr_syndrome_metabolique: false,
          // SELECT: ["Jamais", "Rarement", "Parfois", "Souvent", "Fréquemment"]
          terr_hypoglycemie_reactive: "Souvent"
        },

        // ═══════════════════════════════════════════════════
        // NEURO - OPTIONS EXACTES de axe-neuro.ts
        // ═══════════════════════════════════════════════════
        neuro: {
          // SELECT: ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Fréquemment"]
          neuro_para_crise_vagale: "1-2 fois dans ma vie",
          // SCALE 1-5
          neuro_para_salivation: 2,
          neuro_para_nausee: 2,
          neuro_para_nez_bouche: 3,
          neuro_para_ballonnement: 4,
          neuro_para_sueurs_nuit: 3,
          neuro_para_diarrhee: 2,
          neuro_para_memoire: 4,
          // BOOLEAN
          neuro_para_bradycardie: false,
          // SCALE 1-5
          neuro_para_larmoiement: 2,
          neuro_alpha_froid: 5,
          neuro_alpha_peau_seche: 4,
          neuro_alpha_constipation: 3,
          neuro_alpha_mydriase: 2,
          neuro_alpha_vigilance: 4,
          // BOOLEAN
          neuro_alpha_tension: true,
          // SCALE 1-5
          neuro_alpha_bruxisme: 3,
          neuro_alpha_douleur: 3,
          // BOOLEAN
          neuro_alpha_raynaud: false,
          // SCALE 1-5
          neuro_beta_palpitations: 4,
          neuro_beta_bouffees_chaleur: 4,
          neuro_beta_emotivite: 4,
          neuro_beta_tremblements: 3,
          neuro_beta_spasmes: 3,
          neuro_beta_libido_basse: 4,
          neuro_beta_fatigue_initiative: 4,
          // BOOLEAN
          neuro_beta_bronchospasme: false,
          // SCALE 1-5
          neuro_beta_hypoglycemie: 4,
          neuro_sommeil_endormissement: 4,
          neuro_reveil_nocturne: 5,
          neuro_reveil_1h_3h: 5,
          neuro_reves: 4,
          neuro_somnolence_postprandiale: 5,
          // SELECT: ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Régulièrement"]
          neuro_spasmophilie: "Plusieurs fois",
          // SCALE 1-5
          neuro_fourmillements: 3,
          neuro_oppression_thoracique: 4,
          neuro_crampes_nocturnes: 3,
          neuro_anxiete_anticipation: 4,
          // BOOLEAN
          neuro_histamine_allergies: true,
          // SCALE 1-5
          neuro_histamine_prurit: 3,
          neuro_serotonine_humeur: 4,
          neuro_serotonine_impulsivite: 3
        },

        // ═══════════════════════════════════════════════════
        // ADAPTATIF - vérifié avec axe-adaptatif.ts
        // ═══════════════════════════════════════════════════
        adaptatif: {
          cortico_fatigue_matin: 5,
          cortico_coup_pompe: 5,
          cortico_endurance: 5,
          cortico_reveil_precoce: 5,
          cortico_fatigue_chronique: 5,
          cortico_sel: 4,
          cortico_hypotension: 4,
          cortico_oedemes: 3,
          cortico_soif_excessive: "Jamais soif",
          cortico_tension_arterielle: "Basse (hypotension)",
          cortico_douleurs: 4,
          cortico_cicatrisation: 3,
          cortico_ecchymoses: 3,
          cortico_infections_recidivantes: 4,
          cortico_herpes_recidivant: "Parfois (1-3/an)",
          cortico_allergies: true,
          cortico_stries_violacees: false,
          cortico_acne_dos: false,
          cortico_eczema_plis: true,
          cortico_peau_fine: true,
          cortico_visage_lunaire: false,
          cortico_prise_poids_abdominale: 4,
          cortico_faiblesse_musculaire: 4,
          cortico_cheveux_fonces_naissance: true,
          cortico_libido: 4,
          cortico_pilosite: "Non concerné (homme)",
          cortico_irritabilite_agressivite: 4,
          cortico_irritabilite_faim: 5,
          cortico_bruit: 4,
          cortico_anhedonie: 4,
          cortico_memoire_concentration: 4,
          cortico_difficulte_adaptation: 4,
          cortico_stress_chronique: 5,
          cortico_stress_aigu: true,
          cortico_recuperation_stress: 5,
          cortico_douleur_fosse_iliaque: 3,
          cortico_aggravation_automne_hiver: true,
          cortico_aggravation_printemps: false,
          cortico_date_anniversaire: true
        },

        // ═══════════════════════════════════════════════════
        // THYRO - OPTIONS EXACTES de axe-thyro.ts
        // La plupart sont BOOLEAN!
        // ═══════════════════════════════════════════════════
        thyro: {
          // SCALE 1-5: ["Très lent", "Lent", "Normal", "Rapide", "Très rapide"]
          thyro_metabolisme_general: 2,
          // BOOLEAN
          thyro_frilosite: true,
          thyro_sensation_froid_extremites: true,
          thyro_intolerance_chaleur: false,
          thyro_prise_poids_facile: true,
          thyro_hypoglycemie: true,
          // SCALE 1-5: ["Très lente", "Lente", "Normale", "Vive", "Hyperactive"]
          thyro_energie_mentale: 2,
          // BOOLEAN
          thyro_ralentissement_general: true,
          thyro_difficultes_concentration: true,
          thyro_fatigue_chronique: true,
          thyro_fibromyalgie: false,
          thyro_anxiete_agitation: true,
          thyro_reves_intenses: true,
          thyro_cauchemars: true,
          thyro_rumination: true,
          thyro_sursaut: true,
          thyro_craintif: true,
          thyro_depression_saisonniere: true,
          thyro_reveil_nocturne: true,
          thyro_insomnie: true,
          thyro_hypersomnie: false,
          thyro_chute_cheveux: true,
          thyro_cheveux_secs: true,
          thyro_sourcils_externes: true,
          thyro_ongles_cassants: true,
          thyro_peau_seche: true,
          thyro_myxoedeme: false,
          thyro_oedeme_chevilles: true,
          thyro_cheveux_boucles: false,
          thyro_paume_rouge: false,
          thyro_transit_lent: true,
          thyro_digestion_lente: true,
          thyro_appetit_augmente: false,
          thyro_perte_poids_appetit: false,
          thyro_diarrhee: false,
          thyro_tachycardie_repos: false,
          thyro_palpitations: true,
          thyro_froid_apres_effort: true,
          thyro_pouls_lent: true,
          thyro_crampes: true,
          thyro_tremblements: false,
          thyro_faiblesse_musculaire: true,
          thyro_osteoporose: false,
          thyro_regles_abondantes: true,
          thyro_regles_courtes: false,
          thyro_spm_irritabilite: true,
          thyro_goitre: false,
          thyro_amygdales_hypertrophie: false,
          thyro_voix_rauque: false,
          thyro_yeux_grands: false,
          thyro_exophtalmie: false,
          thyro_traits_fins: false,
          thyro_antecedents_familiaux: true,
          thyro_hashimoto: false,
          thyro_basedow: false,
          // SELECT: ["Non", "Lévothyroxine", "Thyroïdectomie", "Antithyroïdiens"]
          thyro_traitement: "Non"
        },

        // ═══════════════════════════════════════════════════
        // GONADO - OPTIONS EXACTES de axe-gonado.ts
        // ═══════════════════════════════════════════════════
        gonado: {
          // SCALE 1-5: ["Très irréguliers", "Plutôt irréguliers", "Assez réguliers", "Réguliers", "Très réguliers"]
          gona_f_regularite_cycle: 2,
          // SELECT: ["< 21 jours", "21-24 jours", "25-28 jours", "29-35 jours", "> 35 jours"]
          gona_f_duree_cycle: "29-35 jours",
          // SELECT: ["1-2 jours", "3-4 jours", "5-6 jours", "7-8 jours", "> 8 jours"]
          gona_f_duree_regles: "5-6 jours",
          // SCALE 1-5
          gona_f_regles_douloureuses: 2,
          gona_f_flux_abondant: 3,
          // SELECT: ["Pas de caillots", "1er jour surtout", "2ème-3ème jour", "Tout au long des règles", "Fin des règles"]
          gona_f_caillots_timing: "2ème-3ème jour",
          // SCALE 1-5
          gona_f_spotting: 2,
          // BOOLEAN
          gona_f_herpes_post_regles: false,
          // SCALE 1-5
          gona_f_pms_seins: 3,
          // BOOLEAN
          gona_f_seins_fibrokystiques: false,
          // SCALE 1-5
          gona_f_pms_emotionnel: 4,
          gona_f_pms_retention: 3,
          gona_f_menopause_bouffees: 4,
          gona_f_menopause_secheresse: 3,
          gona_f_libido_globale: 2,
          gona_acne: 2,
          gona_pilosite: 2,
          gona_chute_cheveux: 4,
          gona_varices: 3,
          gona_retention_eau: 3,
          // SELECT: ["Droit", "Gauche", "Bilatéral", "Alternant"]
          gona_lateralite: "Bilatéral",
          // SCALE 1-5
          gona_fatigue_cyclique: 4
        },

        // ═══════════════════════════════════════════════════
        // SOMATO - vérifié avec axe-somato.ts
        // ═══════════════════════════════════════════════════
        somato: {
          somato_croissance_rapide: false,
          somato_grande_taille: false,
          somato_ossature_large: false,
          somato_pieds_plats: false,
          somato_hallux_valgus: false,
          somato_sternum_convexe: false,
          somato_cheveux_poussent_vite: false,
          somato_sourcils_proeminents: false,
          somato_cils_epais: false,
          somato_cicatrices_cheloides: false,
          somato_cicatrices_prurigineuses: false,
          somato_retard_cicatrisation: 3,
          somato_hypoglycemie: 4,
          somato_envies_sucre: 5,
          somato_somnolence_postprandiale: 5,
          somato_adiposite_proximale: 3,
          somato_prise_poids_facile: 5,
          somato_amygdales_hypertrophiees: false,
          somato_sinusites_recurrentes: 2,
          somato_levres_epaisses: false,
          somato_langue_empreinte_dents: 3,
          somato_aphtes_frequents: 2,
          somato_dents_espacees: false,
          somato_langue_fissuree: false,
          somato_sensibilite_pancreas: 3,
          somato_polypes_kystes: false,
          somato_lipomes: false,
          somato_antecedents_cancer: false,
          somato_hyperplasie: false,
          somato_taches_rousseur: false,
          somato_peau_pale_laiteuse: false,
          somato_ongles_epais: false,
          somato_acne_pustuleuse: false,
          somato_furoncles: false,
          somato_keratose_pilaire: false,
          somato_tissu_sous_cutane_dense: false,
          somato_ongles_ponctues: false,
          somato_seins_sous_developpes: false,
          somato_seins_volumineux: false,
          somato_mains_oedeme: 2,
          somato_genou_droit_empate: false,
          somato_douleur_epaule_gauche: 2,
          somato_fatigue_generale: 5,
          somato_sensation_froid: 4,
          somato_cycles_irreguliers_prl: 3,
          somato_fibromyalgie: 2,
          somato_maladies_autoimmunes: 2,
          somato_osteoporose: 2
        },

        // ═══════════════════════════════════════════════════
        // DIGESTIF - OPTIONS EXACTES de axe-digestif.ts
        // ═══════════════════════════════════════════════════
        digestif: {
          // SELECT: ["Normale", "Bouche souvent sèche (hypo-salivation)", "Salive abondante, déglutition fréquente (hyper-salivation)", "Salive épaisse, filandreuse"]
          dig_salive_quantite: "Normale",
          // BOOLEAN
          dig_parotides_gonflees: false,
          // SELECT: ["Non, jamais d'angine", "Angines occasionnelles (1-2/an)", "Angines fréquentes (>3/an)", "Amygdales retirées (amygdalectomie)"]
          dig_amygdales: "Angines occasionnelles (1-2/an)",
          // SCALE 1-5
          dig_aphtes: 2,
          // SELECT: ["Non, haleine normale", "Parfois le matin au réveil", "Souvent, même après brossage", "Constamment, gêne sociale"]
          dig_haleine: "Parfois le matin au réveil",
          // BOOLEAN
          dig_gout_metallique: false,
          // SELECT: ["Non, langue rose et propre", "Enduit blanc léger (normal le matin)", "Enduit blanc épais persistant", "Enduit jaunâtre ou verdâtre", "Langue noire ou très foncée"]
          dig_langue_enduit: "Enduit blanc léger (normal le matin)",
          dig_langue_fissures: false,
          dig_langue_empreintes: 3,
          dig_langue_papules: false,
          dig_langue_brulure: false,
          dig_estomac_lourdeur: 4,
          dig_estomac_rgo: 4,
          dig_estomac_rgo_position: 3,
          dig_estomac_eructations: 3,
          dig_estomac_nausees: 2,
          dig_estomac_gout_persistant: 2,
          dig_estomac_douleur: 2,
          dig_foie_graisses: 4,
          dig_foie_appetit_matin: false,
          dig_foie_frissons: 2,
          dig_foie_reveil_nocturne: 4,
          dig_foie_bouche_amere: 3,
          dig_foie_prurit: 2,
          dig_foie_selles_couleur: "Normales (brun)",
          dig_foie_urine_foncee: 2,
          dig_pancreas_ballonnement_immediat: 4,
          dig_pancreas_somnolence: 5,
          dig_pancreas_selles_flottantes: 2,
          dig_pancreas_aliments_visibles: 2,
          dig_pancreas_intolerance_specifique: 3,
          dig_pancreas_sinusites: 2,
          dig_grele_ballonnement_10min: 3,
          dig_grele_gaz_inodores: 3,
          dig_grele_selles_explosives: 2,
          dig_grele_symptomes_systemiques: 3,
          dig_grele_post_antibio: 3,
          dig_colon_ballonnement_tardif: 4,
          dig_colon_gaz_odorants: 3,
          dig_colon_spasmes: 4,
          dig_colon_alternance: true,
          dig_colon_mucus: 2,
          dig_colon_acne_fesses: false,
          dig_transit_frequence: "1 fois/jour",
          dig_transit_constipation: 3,
          dig_transit_urgence: 2,
          dig_transit_diarrhee: 2,
          dig_transit_selles_aspect: "Variables (Type 2-5)",
          dig_transit_douleur_defecation: 2,
          dig_transit_horaire: "Variable",
          dig_transit_sang: false,
          dig_postprandial_froid: 3,
          dig_postprandial_chaleur: 2,
          dig_postprandial_rougissement: 2,
          dig_postprandial_fatigue_glucides: 5,
          dig_postprandial_reflux_lipides: 4,
          dig_postprandial_transpiration: 2,
          dig_postprandial_cicatrisation: 3,
          dig_anus_prurit: 2,
          dig_anus_fissures: false,
          dig_anus_hemorroides: 2,
          dig_anus_incontinence: false
        },

        // ═══════════════════════════════════════════════════
        // IMMUNO - OPTIONS EXACTES de axe-immuno.ts
        // ═══════════════════════════════════════════════════
        immuno: {
          // SCALE 1-5
          immuno_infections_recidivantes: 4,
          immuno_angines_repetition: 2,
          // BOOLEAN
          immuno_otites_repetition: false,
          // SCALE 1-5
          immuno_sinusites_recurrentes: 2,
          immuno_bronchites_recurrentes: 2,
          immuno_cystites_recurrentes: 2,
          immuno_herpes: 3,
          // BOOLEAN
          immuno_zona: false,
          // SCALE 1-5
          immuno_mycoses: 3,
          // BOOLEAN
          immuno_verrues: false,
          // SCALE 1-5
          immuno_fatigue_infection: 4,
          immuno_guerison_lente: 4,
          // BOOLEAN
          immuno_fievre_rare: true,
          immuno_fievre_elevee: false,
          immuno_cicatrisation_lente: 3,
          immuno_lymphocytes_bas: false,
          immuno_ganglions: 2,
          immuno_amygdales_grosses: false,
          immuno_rate_grosse: false,
          immuno_vegetations: false,
          immuno_allergies: 3,
          immuno_eczema: 3,
          immuno_asthme: false,
          immuno_urticaire: 3,
          immuno_atopie_familiale: true,
          immuno_intolerances: 3,
          immuno_autoimmune: "Non",
          immuno_autoimmune_familiale: true,
          immuno_thyroidite: false,
          immuno_declenchement_peripartum: false,
          immuno_douleurs_articulaires: 4,
          immuno_raideur_matinale: 4,
          immuno_crp_elevee: "Non / Normale",
          immuno_vs_elevee: "Non / Normale",
          immuno_creux_suprasternal: false,
          immuno_spasmophilie: 4,
          immuno_transpiration_facile: 3,
          immuno_dermographisme: 3,
          immuno_saison_aggravation: "Automne/Hiver",
          immuno_stress_declencheur: true,
          immuno_alimentation_aggravation: true,
          immuno_antibiotiques_frequents: 3,
          immuno_convalescence_longue: 4,
          immuno_mucus_excessif: 2,
          immuno_vitamine_d_basse: "Oui, déficiente",
          immuno_sommeil_mauvais: 5
        },

        // ═══════════════════════════════════════════════════
        // ORL RESPIRATOIRE - OPTIONS EXACTES de axe-orl-respiratoire.ts
        // ═══════════════════════════════════════════════════
        orlRespiratoire: {
          // SCALE 1-5
          orl_rhinite_frequence: 3,
          // SELECT: ["Jamais", "1-2 fois/an", "3-4 fois/an", "Plus de 4 fois/an", "Chronique"]
          orl_sinusite_recurrente: "1-2 fois/an",
          // SELECT: ["Jamais", "1-2 fois/an", "3-4 fois/an", "Plus de 4 fois/an"]
          orl_angines_frequentes: "1-2 fois/an",
          // SELECT: ["Non", "Volumineuses enfant", "Volumineuses adulte", "Amygdalectomie"]
          orl_amygdales_grosses: "Non",
          // BOOLEAN
          orl_vegetations: false,
          // SELECT: ["Jamais", "Rarement", "Parfois", "Fréquemment"]
          orl_otites_frequentes: "Rarement",
          // SCALE 1-5
          orl_rhinopharyngites: 2,
          orl_eternuements: 3,
          orl_gorge_seche: 3,
          orl_voix_enrouee: 2,
          resp_allergie_respiratoire: 3,
          // SELECT: ["Non", "Oui, printemps", "Oui, été", "Oui, automne", "Oui, toute l'année"]
          resp_allergie_saisonniere: "Oui, printemps",
          // BOOLEAN
          resp_allergie_perannuelle: false,
          // SCALE 1-5
          resp_conjonctivite_allergique: 2,
          // SELECT: ["Non", "Asthme d'effort uniquement", "Asthme intermittent léger", "Asthme persistant modéré", "Asthme persistant sévère"]
          resp_asthme: "Non",
          // BOOLEAN
          resp_asthme_effort: false,
          resp_bronchites_frequentes: 2,
          resp_bronchite_trainante: 2,
          resp_dyspnee_effort: 3,
          resp_oppression_thoracique: 4,
          resp_toux_chronique: 2,
          resp_toux_type: "Sèche",
          resp_toux_nocturne: 2,
          resp_toux_matin: 2,
          resp_crachats_couleur: "Transparent",
          resp_mucus_abondant: 2,
          resp_mucus_epais: 2,
          resp_mucus_laitages: true,
          resp_ecoulement_posterieur: 3,
          resp_infections_enfance: 3,
          resp_tabac: "Non fumeur",
          resp_terrain_atopique: true,
          resp_antecedents_familiaux: true,
          resp_bpco: false,
          resp_traitement_fond: false,
          resp_amelioration_mer: true,
          resp_aggravation_humidite: 3
        },

        // ═══════════════════════════════════════════════════
        // CARDIO METABO - OPTIONS EXACTES!!!
        // ═══════════════════════════════════════════════════
        cardioMetabo: {
          // Cœur & Artères
          cardio_hta: "Non",
          cardio_hypotension_ortho: 4,
          cardio_palpitations: 4,
          cardio_essoufflement_effort: 3,
          cardio_douleur_thoracique: 2,
          cardio_pouls_repos: "60-80 bpm (normal)",

          // Retour Veineux
          cardio_jambes_lourdes: 4,
          cardio_oedemes: 3,
          cardio_varices: "Petites varicosités (télangiectasies)",
          cardio_hemorroides: 2,
          cardio_raynaud: 3,

          // Foie & Splanchnique
          cardio_digestion_graisses: 4,
          cardio_langue_chargee: 3,
          cardio_haleine_matin: 3,

          // Métabolisme - OPTIONS EXACTES
          metabo_tour_taille: "Homme 94-102cm / Femme 80-88cm (limite)",
          metabo_gras_abdominal: 4,
          metabo_hypoglycemie: 4,
          metabo_fringales: 5,
          metabo_soif: 2,
          metabo_cholesterol: "Limite haute",
          metabo_glycemie: "Limite (1-1.10 g/L)",
          metabo_couperose: 2,
          metabo_acanthosis: false
        },

        // ═══════════════════════════════════════════════════
        // URORENAL - OPTIONS EXACTES!!!
        // ═══════════════════════════════════════════════════
        urorenal: {
          uro_miction_frequence: "6-8 fois",
          uro_miction_nocturne: "1-2 fois (régulier)",
          uro_urgence_mictionnelle: "Rarement",
          uro_jet_urinaire: "Fort et régulier",
          uro_miction_incomplete: "Rarement",
          uro_dysurie: "Jamais",
          uro_incontinence: "Jamais",
          uro_infections_recidivantes: "Rarement (<1/an)",
          uro_pyurie: "Jamais",
          uro_hematurie: "Jamais",
          uro_antibiotiques_frequents: "Rarement",
          uro_calculs: "Jamais",
          uro_coliques_nephretiques: false,
          uro_uricemie: "Non",
          uro_terrain_acide: 3,
          uro_oedemes: "Régulièrement le soir",
          uro_diurese: "Normale (1-2L)",
          uro_couleur_urines: "Claire à jaune pâle",
          uro_soif_excessive: "Non",
          uro_insuffisance_renale: "Non",
          uro_prostate_antecedent: "Non concerné (femme)",
          uro_lourdeur_pelvienne: "Non concerné (femme)",
          uro_psa: "Non concerné (femme)",
          uro_douleur_lombaire: "Parfois",
          uro_douleur_pelvienne: "Rarement",
          uro_hypertension: "Non",
          uro_constipation: "Parfois",
          uro_position_assise: "Plus de 6h/jour",
          uro_alimentation_acidifiante: "Modérément",
          uro_medicaments_nephrotoxiques: false,
          uro_diabete: "Non"
        },

        // ═══════════════════════════════════════════════════
        // DERMATO - vérifié
        // ═══════════════════════════════════════════════════
        dermato: {
          derm_peau_seche_corps: 4,
          derm_peau_grasse: 2,
          derm_talons_fendilles: 3,
          derm_keratose_pilaire: false,
          derm_temperature_peau: "Froide",
          derm_secheresse_muqueuses: 3,
          derm_transpiration: 3,
          derm_sueurs_nocturnes: 3,
          derm_acne_visage: 2,
          derm_acne_joues: 2,
          derm_acne_front: 2,
          derm_acne_dos: false,
          derm_acne_purulente: false,
          derm_acne_premenstruelle: 3,
          derm_furoncles: false,
          derm_cheveux_gras: 2,
          derm_chute_diffuse: 4,
          derm_chute_androgenique: 2,
          derm_cheveux_secs: 4,
          derm_cheveux_fins: 3,
          derm_sourcils_queue: 3,
          derm_sourcils_epais: false,
          derm_pilosite_femme: 2,
          derm_ongles_cassants: 4,
          derm_ongles_stries: true,
          derm_ongles_taches: false,
          derm_ongles_lunules: "Petites ou absentes",
          derm_bleus_faciles: 3,
          derm_vergetures: 2,
          derm_cicatrisation_lente: 3,
          derm_cicatrices_cheloide: false,
          derm_dermographisme: 3,
          derm_demangeaisons: 3,
          derm_couperose: 2,
          derm_teint_pale: 3,
          derm_erytheme_palmaire: false,
          derm_eczema: 3,
          derm_eczema_localisation: "Plis de flexion (coudes, genoux)",
          derm_psoriasis: false,
          derm_urticaire: 3,
          derm_infections_recidivantes: 2,
          derm_taches_brunes: 2,
          derm_cellulite: 3
        }
      }
    }
  };

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      interrogatoire: interrogatoireV2,
      sexe: "F"
    }
  });

  console.log('✅ Interrogatoire V3 FINAL rempli!');
  console.log('');
  console.log('📋 Résumé:');
  const axes = Object.keys(interrogatoireV2.v2.answersByAxis);
  let total = 0;
  axes.forEach(axe => {
    const nb = Object.keys(interrogatoireV2.v2.answersByAxis[axe]).length;
    total += nb;
    console.log(`   - ${axe}: ${nb}`);
  });
  console.log(`   TOTAL: ${total} réponses`);
}

main()
  .catch(e => console.error('Erreur:', e))
  .finally(() => prisma.$disconnect());
