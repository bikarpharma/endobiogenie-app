const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script pour remplir l'interrogatoire de Mme BENZARTI Sonia
 * avec le format V2 et les BONS IDs de questions
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

  // Format V2 complet avec les BONS IDs de questions
  const interrogatoireV2 = {
    sexe: "F",
    v2: {
      answersByAxis: {
        // ═══════════════════════════════════════════════════
        // 🟦 BLOC 1: TERRAIN & HISTOIRE
        // ═══════════════════════════════════════════════════
        historique: {
          // Événements Traumatiques (ETE)
          hist_traumatisme_enfance: 3,
          hist_maltraitance: false,
          hist_alcoolisme_parents: false,
          hist_deces_parent_enfance: true,
          hist_abandon_negligence: false,
          hist_divorce_parents: false,

          // Antécédents Enfance
          hist_maladies_recurrentes_enfance: 3,
          hist_amygdalectomie_vegetations: true,
          hist_eczema_asthme_enfance: true,
          hist_convulsions_febriles: false,
          hist_croissance_precoce_tardive: "Normale",
          hist_maladies_infantiles: true,
          hist_developpement_psychomoteur: false,
          hist_temperament_enfance: "Anxieux ou craintif",
          hist_alimentation_enfance: true,

          // Antécédents Familiaux
          hist_antecedents_cancer_famille: true,
          hist_maladies_autoimmunes_famille: true,
          hist_cardiovasculaire_famille: true,
          hist_diabete_famille: true,
          hist_psychiatrique_famille: true,
          hist_thyroide_famille: true,
          hist_neurologique_famille: false,

          // Antécédents Adulte
          hist_chirurgies_majeures: 2,
          hist_hospitalisations: false,
          hist_maladies_chroniques: false,

          // Grossesse & Naissance
          hist_naissance_prematuree: "Naissance normale à terme",
          hist_grossesse_mere_difficile: true,
          hist_accouchement_difficile: false,
          hist_allaitement: "3-6 mois",

          // Traitements & Expositions
          hist_antibiotiques_enfance: 3,
          hist_vaccinations_reactions: false,
          hist_traitements_hormonaux: 4,
          hist_psychotropes: false,
          hist_expositions_toxiques: false,

          // Stress & Événements Vie
          hist_stress_chronique_vie: 4,
          hist_deuil_majeur: true,
          hist_accidents_graves: false,
          hist_rupture_relation_majeure: true,
          hist_pause_genitale_symptomes: true,
          hist_menopause_andropause: 4,
          hist_changement_personnalite: true,

          // Trajectoire d'Adaptation
          hist_periode_hyperfonctionnement: true,
          hist_periode_hypofonctionnement: true,
          hist_resilience: 2
        },

        modeVie: {
          // Architecture du Sommeil
          vie_sommeil_qualite: 2,
          vie_sommeil_heure_coucher: "23h-minuit",
          vie_sommeil_duree: "5-6h",
          vie_sommeil_endormissement: "Souvent",
          vie_sommeil_reveils: "Toujours",
          vie_sommeil_reves: "Rêves vifs et agités",
          vie_sommeil_reveil_fatigue: "Toujours",

          // Alimentation
          vie_alimentation_equilibre: 3,
          vie_alimentation_repas: "Rarement",
          vie_envies_sucre: 5,
          vie_alimentation_laitages: "Occasionnel",
          vie_alimentation_gluten: "Quotidien",
          vie_alimentation_fibres: "Insuffisant",
          vie_hydratation: "Moins de 1L",

          // Exercice
          vie_exercice_frequence: "Jamais",
          vie_exercice_type: "Aucun",
          vie_exercice_exces: false,
          vie_sedentarite: "Très sédentaire",

          // Toxiques
          vie_tabac: "Non fumeur",
          vie_alcool: "Occasionnel",
          vie_cafe: "3-4 tasses",
          vie_ecrans_soir: true,

          // Stress & Émotions
          vie_stress_chronique: 5,
          vie_colere: 3,
          vie_anxiete: 4,
          vie_relaxation: "Jamais",
          vie_satisfaction_professionnelle: 2,
          vie_horaires_reguliers: false,
          vie_sieste: true,
          vie_saison_sensible: "Automne/Hiver",
          vie_jet_lag: false
        },

        terrains: {
          // Tempérament & SNA
          terr_temperament_global: "Anxieux hypervigilant",
          terr_sommeil_enfance: "Difficile",
          terr_comportement_intestinal: "Alternant",
          terr_vagotonie: 3,
          terr_sympathicotonie: 4,

          // Spasmophilie
          terr_spasmophilie: 4,
          terr_attaques_panique: 2,
          terr_lipothymie: 2,
          terr_paresthesies: 3,
          terr_spasmes_digestifs: 4,

          // Immunité
          terr_infections_recidivantes: 4,
          terr_inflammation_chronique: 3,
          terr_congestion_hepatique: 3,
          terr_congestion_pelvienne: 3,
          terr_dysbiose: 4,

          // Auto-immunité & Allergies
          terr_auto_immun: 2,
          terr_allergies_multiples: 3,
          terr_eczema_psoriasis: 3,
          terr_asthme: false,

          // Prolifération
          terr_tumeurs_benignes: false,
          terr_cancer_personnel: false,
          terr_cancer_familial: true,
          terr_verrues_molluscum: false,

          // Dégénératif
          terr_degeneratif: 2,
          terr_calcifications: false,
          terr_sclerose: false,

          // Adaptation
          terr_fatigue_adaptative: 5,
          terr_sensibilite_stress: 5,
          terr_recuperation_lente: 5,
          terr_aggravation_saisonniere: true,

          // Terrain Familial
          terr_terrain_familial: true,
          terr_maladies_meme_famille: true,
          terr_endometriose_famille: false,

          // Métabolique
          terr_resistance_insuline: 3,
          terr_syndrome_metabolique: 3,
          terr_hypoglycemie_reactive: 4
        },

        // ═══════════════════════════════════════════════════
        // 🟪 BLOC 2: LES GESTIONNAIRES
        // ═══════════════════════════════════════════════════
        neuro: {
          // Parasympathique
          neuro_para_crise_vagale: 2,
          neuro_para_salivation: 2,
          neuro_para_nausee: 2,
          neuro_para_nez_bouche: 3,
          neuro_para_ballonnement: 4,
          neuro_para_sueurs_nuit: 3,
          neuro_para_diarrhee: 2,
          neuro_para_memoire: 4,
          neuro_para_bradycardie: false,
          neuro_para_larmoiement: 2,

          // Alpha-sympathique
          neuro_alpha_froid: 5,
          neuro_alpha_peau_seche: 4,
          neuro_alpha_constipation: 3,
          neuro_alpha_mydriase: false,
          neuro_alpha_vigilance: 4,
          neuro_alpha_tension: 4,
          neuro_alpha_bruxisme: 3,
          neuro_alpha_douleur: 3,
          neuro_alpha_raynaud: 3,

          // Bêta-sympathique
          neuro_beta_palpitations: 4,
          neuro_beta_bouffees_chaleur: 4,
          neuro_beta_emotivite: 4,
          neuro_beta_tremblements: 3,
          neuro_beta_spasmes: 3,
          neuro_beta_libido_basse: 4,
          neuro_beta_fatigue_initiative: 4,
          neuro_beta_bronchospasme: 2,
          neuro_beta_hypoglycemie: 4,

          // Sommeil
          neuro_sommeil_endormissement: 4,
          neuro_reveil_nocturne: 5,
          neuro_reveil_1h_3h: 5,
          neuro_reves: "Agités",
          neuro_somnolence_postprandiale: 5,

          // Spasmophilie
          neuro_spasmophilie: 4,
          neuro_fourmillements: 3,
          neuro_oppression_thoracique: 4,
          neuro_crampes_nocturnes: 3,
          neuro_anxiete_anticipation: 4,

          // Autacoïdes
          neuro_histamine_allergies: 3,
          neuro_histamine_prurit: 3,
          neuro_serotonine_humeur: 4,
          neuro_serotonine_impulsivite: 3
        },

        adaptatif: {
          // Énergie & Rythme
          cortico_fatigue_matin: 5,
          cortico_coup_pompe: 5,
          cortico_endurance: 5,
          cortico_reveil_precoce: 5,
          cortico_fatigue_chronique: 5,

          // Eau & Sel
          cortico_sel: 4,
          cortico_hypotension: 4,
          cortico_oedemes: 3,
          cortico_soif_excessive: "Jamais soif",
          cortico_tension_arterielle: "Basse (hypotension)",

          // Inflammation & Immunité
          cortico_douleurs: 4,
          cortico_cicatrisation: 3,
          cortico_ecchymoses: 3,
          cortico_infections_recidivantes: 4,
          cortico_herpes_recidivant: "Parfois (1-3/an)",
          cortico_allergies: true,

          // Signes Cutanés
          cortico_stries_violacees: false,
          cortico_acne_dos: false,
          cortico_eczema_plis: true,
          cortico_peau_fine: true,

          // Morphologie & Métabolisme
          cortico_visage_lunaire: false,
          cortico_prise_poids_abdominale: 4,
          cortico_faiblesse_musculaire: 4,
          cortico_cheveux_fonces_naissance: true,

          // DHEA & Androgènes
          cortico_libido: 4,
          cortico_pilosite: "Non",
          cortico_irritabilite_agressivite: 4,

          // Psychisme & Cognition
          cortico_irritabilite_faim: 5,
          cortico_bruit: 4,
          cortico_anhedonie: 4,
          cortico_memoire_concentration: 4,
          cortico_difficulte_adaptation: 4,

          // Stress & Adaptation
          cortico_stress_chronique: 5,
          cortico_stress_aigu: true,
          cortico_recuperation_stress: 5,

          // Digestif
          cortico_douleur_fosse_iliaque: 3,

          // Chronobiologie
          cortico_aggravation_automne_hiver: true,
          cortico_aggravation_printemps: false,
          cortico_date_anniversaire: true
        },

        thyro: {
          // Métabolisme général
          thyro_metabolisme_general: "Lent",
          thyro_frilosite: 4,
          thyro_sensation_froid_extremites: 5,
          thyro_intolerance_chaleur: 1,
          thyro_prise_poids_facile: 4,
          thyro_hypoglycemie: 4,

          // Énergie mentale
          thyro_energie_mentale: 2,
          thyro_ralentissement_general: 4,
          thyro_difficultes_concentration: 4,
          thyro_fatigue_chronique: 5,
          thyro_fibromyalgie: 2,

          // Psychisme
          thyro_anxiete_agitation: 3,
          thyro_reves_intenses: 4,
          thyro_cauchemars: 3,
          thyro_rumination: 4,
          thyro_sursaut: 3,
          thyro_craintif: 3,
          thyro_depression_saisonniere: 4,

          // Sommeil
          thyro_reveil_nocturne: 5,
          thyro_insomnie: 4,
          thyro_hypersomnie: 2,

          // Peau & Phanères
          thyro_chute_cheveux: 4,
          thyro_cheveux_secs: 4,
          thyro_sourcils_externes: 3,
          thyro_ongles_cassants: 4,
          thyro_peau_seche: 4,
          thyro_myxoedeme: 2,
          thyro_oedeme_chevilles: 3,
          thyro_cheveux_boucles: false,
          thyro_paume_rouge: false,

          // Digestif
          thyro_transit_lent: 3,
          thyro_digestion_lente: 4,
          thyro_appetit_augmente: 2,
          thyro_perte_poids_appetit: 1,
          thyro_diarrhee: 1,

          // Cardiovasculaire
          thyro_tachycardie_repos: 2,
          thyro_palpitations: 3,
          thyro_froid_apres_effort: 4,
          thyro_pouls_lent: 3,

          // Musculaire
          thyro_crampes: 3,
          thyro_tremblements: 2,
          thyro_faiblesse_musculaire: 4,
          thyro_osteoporose: 2,

          // Gynéco
          thyro_regles_abondantes: 3,
          thyro_regles_courtes: 2,
          thyro_spm_irritabilite: 4,

          // Local
          thyro_goitre: false,
          thyro_amygdales_hypertrophie: false,
          thyro_voix_rauque: 2,
          thyro_yeux_grands: false,
          thyro_exophtalmie: false,
          thyro_traits_fins: false,

          // Antécédents
          thyro_antecedents_familiaux: true,
          thyro_hashimoto: false,
          thyro_basedow: false,
          thyro_traitement: false
        },

        gonado: {
          // Cycle menstruel
          gona_f_regularite_cycle: "Irrégulier",
          gona_f_duree_cycle: "Variable (25-35j)",
          gona_f_duree_regles: "4-5 jours",
          gona_f_regles_douloureuses: 2,
          gona_f_flux_abondant: 3,
          gona_f_caillots_timing: "Parfois",
          gona_f_spotting: 2,
          gona_f_herpes_post_regles: false,

          // SPM
          gona_f_pms_seins: 3,
          gona_f_seins_fibrokystiques: 2,
          gona_f_pms_emotionnel: 4,
          gona_f_pms_retention: 3,

          // Périménopause
          gona_f_menopause_bouffees: 4,
          gona_f_menopause_secheresse: 3,
          gona_f_libido_globale: 2,

          // Signes communs
          gona_acne: 2,
          gona_pilosite: 2,
          gona_chute_cheveux: 4,
          gona_varices: 3,
          gona_retention_eau: 3,
          gona_lateralite: "Bilatéral",
          gona_fatigue_cyclique: 4
        },

        somato: {
          // Morphologie GH
          somato_croissance_rapide: false,
          somato_grande_taille: false,
          somato_ossature_large: false,
          somato_pieds_plats: false,
          somato_hallux_valgus: false,
          somato_sternum_convexe: false,
          somato_cheveux_poussent_vite: false,
          somato_sourcils_proeminents: false,
          somato_cils_epais: false,

          // Cicatrisation
          somato_cicatrices_cheloides: false,
          somato_cicatrices_prurigineuses: false,
          somato_retard_cicatrisation: 3,

          // Métabolisme glucidique
          somato_hypoglycemie: 4,
          somato_envies_sucre: 5,
          somato_somnolence_postprandiale: 5,
          somato_adiposite_proximale: 3,
          somato_prise_poids_facile: 5,

          // ORL
          somato_amygdales_hypertrophiees: false,
          somato_sinusites_recurrentes: 2,

          // Cavité buccale
          somato_levres_epaisses: false,
          somato_langue_empreinte_dents: 3,
          somato_aphtes_frequents: 2,
          somato_dents_espacees: false,
          somato_langue_fissuree: false,

          // Pancréas
          somato_sensibilite_pancreas: 3,

          // Prolifération
          somato_polypes_kystes: false,
          somato_lipomes: false,
          somato_antecedents_cancer: false,
          somato_hyperplasie: false,

          // Peau
          somato_taches_rousseur: false,
          somato_peau_pale_laiteuse: false,
          somato_ongles_epais: false,
          somato_acne_pustuleuse: false,
          somato_furoncles: false,
          somato_keratose_pilaire: false,
          somato_tissu_sous_cutane_dense: false,
          somato_ongles_ponctues: false,

          // Seins
          somato_seins_sous_developpes: false,
          somato_seins_volumineux: false,

          // Articulations
          somato_mains_oedeme: 2,
          somato_genou_droit_empate: false,
          somato_douleur_epaule_gauche: 2,

          // Général
          somato_fatigue_generale: 5,
          somato_sensation_froid: 4,
          somato_cycles_irreguliers_prl: 3,
          somato_fibromyalgie: 2,
          somato_maladies_autoimmunes: 2,
          somato_osteoporose: 2
        },

        // ═══════════════════════════════════════════════════
        // 🟩 BLOC 3: ÉMONCTOIRES & ORGANES
        // ═══════════════════════════════════════════════════
        digestif: {
          // Cavité buccale
          dig_salive_quantite: "Normale",
          dig_parotides_gonflees: false,
          dig_amygdales: "Normales",
          dig_aphtes: 2,
          dig_haleine: 2,
          dig_gout_metallique: false,
          dig_langue_enduit: true,
          dig_langue_fissures: false,
          dig_langue_empreintes: 3,
          dig_langue_papules: false,
          dig_langue_brulure: false,

          // Estomac
          dig_estomac_lourdeur: 4,
          dig_estomac_rgo: 4,
          dig_estomac_rgo_position: 3,
          dig_estomac_eructations: 3,
          dig_estomac_nausees: 2,
          dig_estomac_gout_persistant: 2,
          dig_estomac_douleur: 2,

          // Foie
          dig_foie_graisses: 4,
          dig_foie_appetit_matin: false,
          dig_foie_frissons: 2,
          dig_foie_reveil_nocturne: 4,
          dig_foie_bouche_amere: 3,
          dig_foie_prurit: 2,
          dig_foie_selles_couleur: "Normales",
          dig_foie_urine_foncee: 2,

          // Pancréas
          dig_pancreas_ballonnement_immediat: 4,
          dig_pancreas_somnolence: 5,
          dig_pancreas_selles_flottantes: 2,
          dig_pancreas_aliments_visibles: 2,
          dig_pancreas_intolerance_specifique: 3,
          dig_pancreas_sinusites: 2,

          // Grêle
          dig_grele_ballonnement_10min: 3,
          dig_grele_gaz_inodores: 3,
          dig_grele_selles_explosives: 2,
          dig_grele_symptomes_systemiques: 3,
          dig_grele_post_antibio: 3,

          // Côlon
          dig_colon_ballonnement_tardif: 4,
          dig_colon_gaz_odorants: 3,
          dig_colon_spasmes: 4,
          dig_colon_alternance: true,
          dig_colon_mucus: 2,
          dig_colon_acne_fesses: false,

          // Transit
          dig_transit_frequence: "1x/jour ou moins",
          dig_transit_constipation: 3,
          dig_transit_urgence: 2,
          dig_transit_diarrhee: 2,
          dig_transit_selles_aspect: "Variables",
          dig_transit_douleur_defecation: 2,
          dig_transit_horaire: "Variable",
          dig_transit_sang: false,

          // Postprandial
          dig_postprandial_froid: 3,
          dig_postprandial_chaleur: 2,
          dig_postprandial_rougissement: 2,
          dig_postprandial_fatigue_glucides: 5,
          dig_postprandial_reflux_lipides: 4,
          dig_postprandial_transpiration: 2,
          dig_postprandial_cicatrisation: 3,

          // Anus
          dig_anus_prurit: 2,
          dig_anus_fissures: false,
          dig_anus_hemorroides: 2,
          dig_anus_incontinence: false
        },

        immuno: {
          // Infections
          immuno_infections_recidivantes: 4,
          immuno_angines_repetition: 2,
          immuno_otites_repetition: 2,
          immuno_sinusites_recurrentes: 2,
          immuno_bronchites_recurrentes: 2,
          immuno_cystites_recurrentes: 2,
          immuno_herpes: 3,
          immuno_zona: false,
          immuno_mycoses: 3,
          immuno_verrues: false,

          // Immunité
          immuno_fatigue_infection: 4,
          immuno_guerison_lente: 4,
          immuno_fievre_rare: 2,
          immuno_fievre_elevee: false,
          immuno_cicatrisation_lente: 3,
          immuno_lymphocytes_bas: false,
          immuno_ganglions: 2,
          immuno_amygdales_grosses: false,
          immuno_rate_grosse: false,
          immuno_vegetations: false,

          // Allergies
          immuno_allergies: 3,
          immuno_eczema: 3,
          immuno_asthme: false,
          immuno_urticaire: 3,
          immuno_atopie_familiale: true,
          immuno_intolerances: 3,

          // Auto-immunité
          immuno_autoimmune: false,
          immuno_autoimmune_familiale: true,
          immuno_thyroidite: false,
          immuno_declenchement_peripartum: false,

          // Inflammation
          immuno_douleurs_articulaires: 4,
          immuno_raideur_matinale: 4,
          immuno_crp_elevee: false,
          immuno_vs_elevee: false,

          // SNA
          immuno_creux_suprasternal: false,
          immuno_spasmophilie: 4,
          immuno_transpiration_facile: 3,
          immuno_dermographisme: 3,

          // Facteurs aggravants
          immuno_saison_aggravation: "Automne/Hiver",
          immuno_stress_declencheur: true,
          immuno_alimentation_aggravation: true,
          immuno_antibiotiques_frequents: 3,
          immuno_convalescence_longue: 4,
          immuno_mucus_excessif: 2,
          immuno_vitamine_d_basse: true,
          immuno_sommeil_mauvais: 5
        },

        orlRespiratoire: {
          // ORL
          orl_rhinite_frequence: 3,
          orl_sinusite_recurrente: 2,
          orl_angines_frequentes: 2,
          orl_amygdales_grosses: false,
          orl_vegetations: false,
          orl_otites_frequentes: 2,
          orl_rhinopharyngites: 2,
          orl_eternuements: 3,
          orl_gorge_seche: 3,
          orl_voix_enrouee: 2,

          // Allergies respiratoires
          resp_allergie_respiratoire: 3,
          resp_allergie_saisonniere: 3,
          resp_allergie_perannuelle: 2,
          resp_conjonctivite_allergique: 2,

          // Voies respiratoires
          resp_asthme: false,
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
          resp_mucus_laitages: 3,
          resp_ecoulement_posterieur: 3,

          // Antécédents
          resp_infections_enfance: 3,
          resp_tabac: "Non",
          resp_terrain_atopique: true,
          resp_antecedents_familiaux: true,
          resp_bpco: false,
          resp_traitement_fond: false,
          resp_amelioration_mer: true,
          resp_aggravation_humidite: 3
        },

        cardioMetabo: {
          // Cardiovasculaire
          cardio_hta: false,
          cardio_hypotension_ortho: 4,
          cardio_palpitations: 4,
          cardio_essoufflement_effort: 3,
          cardio_douleur_thoracique: 2,
          cardio_pouls_repos: "60-70",
          cardio_jambes_lourdes: 4,
          cardio_oedemes: 3,
          cardio_varices: 3,
          cardio_hemorroides: 2,
          cardio_raynaud: 3,
          cardio_digestion_graisses: 4,
          cardio_langue_chargee: true,
          cardio_haleine_matin: 3,

          // Métabolique
          metabo_tour_taille: ">88cm",
          metabo_gras_abdominal: 4,
          metabo_hypoglycemie: 4,
          metabo_fringales: 5,
          metabo_soif: "Jamais soif",
          metabo_cholesterol: true,
          metabo_glycemie: "Limite haute (1.00-1.10)",
          metabo_couperose: 2,
          metabo_acanthosis: false
        },

        urorenal: {
          // Mictions
          uro_miction_frequence: "6-8/jour",
          uro_miction_nocturne: 2,
          uro_urgence_mictionnelle: 2,
          uro_jet_urinaire: "Normal",
          uro_miction_incomplete: 2,
          uro_dysurie: false,
          uro_incontinence: false,

          // Infections
          uro_infections_recidivantes: 2,
          uro_pyurie: false,
          uro_hematurie: false,
          uro_antibiotiques_frequents: 2,

          // Calculs
          uro_calculs: false,
          uro_coliques_nephretiques: false,
          uro_uricemie: false,
          uro_terrain_acide: 3,

          // Rein
          uro_oedemes: 3,
          uro_diurese: "Normale",
          uro_couleur_urines: "Claire",
          uro_soif_excessive: false,
          uro_insuffisance_renale: false,

          // Prostate (NA)
          uro_prostate_antecedent: false,

          // Douleurs
          uro_lourdeur_pelvienne: 2,
          uro_psa: false,
          uro_douleur_lombaire: 3,
          uro_douleur_pelvienne: 2,

          // Facteurs
          uro_hypertension: false,
          uro_constipation: 3,
          uro_position_assise: true,
          uro_alimentation_acidifiante: 3,
          uro_medicaments_nephrotoxiques: false,
          uro_diabete: false
        },

        dermato: {
          // Peau
          derm_peau_seche_corps: 4,
          derm_peau_grasse: 2,
          derm_talons_fendilles: 3,
          derm_keratose_pilaire: false,
          derm_temperature_peau: "Froide",
          derm_secheresse_muqueuses: 3,
          derm_transpiration: 3,
          derm_sueurs_nocturnes: 3,

          // Acné
          derm_acne_visage: 2,
          derm_acne_joues: 2,
          derm_acne_front: 2,
          derm_acne_dos: false,
          derm_acne_purulente: false,
          derm_acne_premenstruelle: 3,
          derm_furoncles: false,

          // Cheveux
          derm_cheveux_gras: 2,
          derm_chute_diffuse: 4,
          derm_chute_androgenique: 2,
          derm_cheveux_secs: 4,
          derm_cheveux_fins: 3,

          // Sourcils
          derm_sourcils_queue: 3,
          derm_sourcils_epais: false,
          derm_pilosite_femme: 2,

          // Ongles
          derm_ongles_cassants: 4,
          derm_ongles_stries: true,
          derm_ongles_taches: false,
          derm_ongles_lunules: "Petites",

          // Cicatrisation
          derm_bleus_faciles: 3,
          derm_vergetures: 2,
          derm_cicatrisation_lente: 3,
          derm_cicatrices_cheloide: false,
          derm_dermographisme: 3,
          derm_demangeaisons: 3,

          // Vasculaire
          derm_couperose: 2,
          derm_teint_pale: 3,
          derm_erytheme_palmaire: false,

          // Pathologies
          derm_eczema: 3,
          derm_eczema_localisation: "Plis de flexion",
          derm_psoriasis: false,
          derm_urticaire: 3,
          derm_infections_recidivantes: 2,
          derm_taches_brunes: 2,
          derm_cellulite: 3
        }
      }
    }
  };

  // Mise à jour de la patiente
  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      interrogatoire: interrogatoireV2,
      sexe: "F"
    }
  });

  console.log('✅ Interrogatoire V2 rempli avec les BONS IDs!');
  console.log('');
  console.log('📋 Résumé des axes remplis:');
  const axes = Object.keys(interrogatoireV2.v2.answersByAxis);
  axes.forEach(axe => {
    const nbQuestions = Object.keys(interrogatoireV2.v2.answersByAxis[axe]).length;
    console.log(`   - ${axe}: ${nbQuestions} questions`);
  });
}

main()
  .catch(e => console.error('Erreur:', e))
  .finally(() => prisma.$disconnect());
