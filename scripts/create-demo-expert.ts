/**
 * ============================================================================
 * SCRIPT DE CRÉATION - CAS CLINIQUE EXPERT DÉMO
 * ============================================================================
 * Patiente: Mme BENZARTI Sonia - 47 ans
 * Cas: Triade Hypothyroïdie latente + Épuisement corticosurrénalien + Spasmophilie
 *
 * Usage: npx tsx scripts/create-demo-expert.ts
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Création du cas clinique expert BENZARTI Sonia...\n');

  // Trouver le premier utilisateur (praticien)
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ Aucun utilisateur trouvé. Créez d\'abord un compte.');
    process.exit(1);
  }
  console.log(`✅ Utilisateur trouvé: ${user.email}`);

  // Vérifier si la patiente existe déjà
  const existingPatient = await prisma.patient.findFirst({
    where: { nom: 'BENZARTI', prenom: 'Sonia' }
  });

  if (existingPatient) {
    console.log('⚠️ Patiente BENZARTI Sonia existe déjà. Suppression et recréation...');
    await prisma.patient.delete({ where: { id: existingPatient.id } });
  }

  // Générer un numéro patient unique
  const patientCount = await prisma.patient.count();
  const numeroPatient = `PAT-${String(patientCount + 1).padStart(3, '0')}`;

  // ========================================
  // DONNÉES PATIENT
  // ========================================
  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      numeroPatient,
      nom: 'BENZARTI',
      prenom: 'Sonia',
      dateNaissance: new Date('1977-05-15'), // 47 ans
      sexe: 'F',
      telephone: '+216 98 765 432',
      email: 'sonia.benzarti@demo.tn',
      notes: 'Cas clinique expert - Démo walkthrough pour médecin expert ami de Lapraz',

      // ATCD & Allergies
      allergies: 'Rhinite saisonnière légère (pollens)',
      allergiesStructured: JSON.stringify([
        { type: 'environnement', name: 'Pollens', severity: 'legere', notes: 'Rhinite saisonnière' }
      ]),
      atcdMedicaux: 'Colite fonctionnelle depuis 10 ans. Mère: hypothyroïdie + diabète T2.',
      atcdChirurgicaux: 'Appendicectomie à 22 ans (1999)',
      traitements: 'Aucun traitement en cours',

      // Contexte enrichi
      pathologiesAssociees: JSON.stringify([
        'Syndrome de l\'intestin irritable',
        'Péri-ménopause'
      ]),
      symptomesActuels: JSON.stringify([
        'Fatigue matinale intense',
        'Frilosité permanente',
        'Prise de poids malgré régime',
        'Troubles du sommeil (réveils 3-4h)',
        'Crampes nocturnes',
        'Ballonnements post-prandiaux',
        'Chute de cheveux diffuse'
      ]),

      // Terrains chroniques
      chronicProfile: JSON.stringify({
        apcis: [],
        otherDiseases: [
          { name: 'Colite fonctionnelle', since: '2014', controlled: false },
          { name: 'Péri-ménopause', since: '2022', controlled: false }
        ]
      }),

      // ========================================
      // INTERROGATOIRE ENDOBIOGÉNIQUE COMPLET
      // ========================================
      interrogatoire: JSON.stringify({
        // 🟦 BLOC 1: TERRAIN & HISTOIRE
        historique: {
          atcd_familiaux: {
            mere_hypothyroidie: true,
            mere_diabete: true,
            pere_hta: false,
            cancer_familial: false,
            notes: 'Mère: hypothyroïdie Hashimoto + diabète T2 depuis 60 ans'
          },
          atcd_personnels: {
            colite_fonctionnelle: true,
            appendicectomie: true,
            chocs_emotionnels: 'Divorce difficile à 42 ans (2019)',
            grossesses: 2,
            fausses_couches: 0
          },
          ligne_de_vie: {
            evenements_marquants: [
              { age: 22, evenement: 'Appendicectomie', impact: 'digestif' },
              { age: 37, evenement: 'Début colite fonctionnelle', impact: 'digestif/stress' },
              { age: 42, evenement: 'Divorce', impact: 'psycho-émotionnel majeur' },
              { age: 45, evenement: 'Début péri-ménopause', impact: 'hormonal' }
            ]
          }
        },

        modeVie: {
          sommeil: {
            qualite: 'mauvaise',
            difficulte_endormissement: true,
            reveils_nocturnes: true,
            heure_reveil: '3-4h',
            fatigue_au_reveil: true,
            duree_moyenne: 6
          },
          alimentation: {
            petit_dejeuner: 'souvent sauté',
            repas_reguliers: false,
            grignotage: true,
            envies_sucre: true,
            envies_sale: true,
            intolerance_lactose: false,
            intolerance_gluten: false
          },
          hydratation: {
            eau_par_jour: 1,
            cafe_par_jour: 5,
            the_par_jour: 1,
            alcool_par_semaine: 2
          },
          activite_physique: {
            frequence: 'rare',
            type: 'marche',
            duree_minutes: 30,
            sedentarite: true
          },
          toxiques: {
            tabac: false,
            alcool: 'occasionnel',
            cannabis: false
          },
          stress: {
            niveau_percu: 8,
            sources: ['travail', 'charge_mentale'],
            capacite_recuperation: 'faible'
          }
        },

        terrains: {
          spasmophile: {
            present: true,
            score: 8,
            signes: [
              'crampes_nocturnes',
              'paupiere_saute',
              'boule_gorge',
              'hyperventilation_stress',
              'fourmillements_extremites'
            ]
          },
          atopique: {
            present: true,
            score: 3,
            signes: ['rhinite_saisonniere']
          },
          auto_immun: { present: false, score: 0, signes: [] },
          congestif: { present: false, score: 0, signes: [] },
          metabolique: {
            present: true,
            score: 4,
            signes: ['adiposite_abdominale', 'glycemie_limite']
          },
          degeneratif: { present: false, score: 0, signes: [] },
          oxydatif: { present: true, score: 3, signes: ['cheveux_cassants', 'ongles_stries'] }
        },

        // 🟪 BLOC 2: LES GESTIONNAIRES
        neuro: {
          parasympathique: {
            hyperactivite: false,
            signes: []
          },
          alpha_sympathique: {
            hyperactivite: true,
            signes: ['mains_froides', 'pieds_froids', 'paleur']
          },
          beta_sympathique: {
            hypoactivite: true,
            signes: ['palpitations_effort', 'fatigue_effort']
          },
          spasmophilie: {
            confirmee: true,
            type: 'mixte',
            signes: [
              'hypersensibilite_sensorielle',
              'hyperemotivite',
              'tremblements_fins',
              'crampes_nocturnes',
              'oppression_thoracique'
            ]
          }
        },

        adaptatif: {
          fatigue: {
            matinale: true,
            coup_pompe_11h: true,
            coup_pompe_17h: true,
            recuperation_weekend: false
          },
          stress: {
            tolerance: 'faible',
            irritabilite: true,
            pleurs_faciles: true,
            anxiete: true
          },
          signes_hypocorticisme: {
            envies_sale: true,
            hypotension_orthostatique: true,
            hypoglycemie_reactive: true,
            infections_repetees: false
          }
        },

        thyro: {
          hypometabolisme: {
            frilosite: true,
            constipation: true,
            prise_poids: true,
            kg_pris: 5,
            periode: '3 ans'
          },
          signes_cutanes: {
            peau_seche: true,
            cheveux_secs: true,
            cheveux_cassants: true,
            chute_cheveux: true,
            ongles_stries: true,
            ongles_cassants: true
          },
          signes_cognitifs: {
            ralentissement: true,
            oublis_mots: true,
            difficulte_concentration: true,
            brouillard_mental: true
          }
        },

        gonado: {
          cycles: {
            reguliers: false,
            duree_min: 28,
            duree_max: 45,
            dernieres_regles: '2024-11-15',
            abondance: 'normale'
          },
          spm: {
            present: true,
            signes: ['irritabilite', 'seins_tendus', 'retention_eau']
          },
          perimenopause: {
            bouffees_chaleur: true,
            frequence: 'occasionnelle',
            sueurs_nocturnes: false,
            secheresse_vaginale: true,
            libido_diminuee: true
          }
        },

        somato: {
          croissance: 'normale',
          masse_musculaire: 'diminuee',
          recuperation_physique: 'lente',
          vieillissement_premature: true
        },

        // 🟩 BLOC 3: ÉMONCTOIRES & ORGANES
        digestif: {
          estomac: {
            reflux: true,
            frequence: 'occasionnel',
            pyrosis: false,
            dyspepsie: true
          },
          intestin: {
            ballonnements: true,
            gaz: true,
            alternance_transit: true,
            douleurs_abdominales: true,
            localisation: 'diffuse'
          },
          foie: {
            langue_chargee_matin: true,
            mauvaise_haleine: false,
            intolerance_gras: false
          },
          selles: {
            frequence: 'tous les 2-3 jours',
            consistance: 'dures',
            couleur: 'normale'
          }
        },

        immuno: {
          infections_repetees: false,
          allergies: {
            respiratoires: true,
            type: 'rhinite saisonnière',
            severite: 'legere'
          },
          auto_immunite: {
            suspicion: false,
            marqueurs: []
          }
        },

        cardioMetabo: {
          tension_arterielle: {
            systolique: 115,
            diastolique: 70,
            tendance: 'basse'
          },
          palpitations: {
            present: true,
            declencheur: 'stress',
            frequence: 'occasionnel'
          },
          glycemie: {
            a_jeun: 5.2,
            tendance: 'limite_haute'
          },
          lipides: {
            cholesterol_total: 2.3,
            hdl: 0.65,
            ldl: 1.45,
            triglycerides: null
          },
          tour_taille: 88
        },

        dermato: {
          peau_seche: true,
          eczema: {
            present: true,
            localisation: 'plis des coudes',
            saison: 'hiver'
          },
          chute_cheveux: {
            present: true,
            type: 'diffuse',
            depuis: '1 an'
          }
        },

        urorenal: {
          mictions: {
            frequence: 'normale',
            nycturie: false,
            brulures: false
          },
          oedemes: {
            present: true,
            localisation: 'chevilles soir',
            cyclique: true
          }
        },

        orlRespiratoire: {
          nez: {
            rhinite: true,
            type: 'allergique_saisonniere'
          },
          gorge: {
            boule_gorge: true,
            angines_repetees: false
          },
          bronches: {
            toux: false,
            dyspnee: false
          }
        }
      }),

      consentementRGPD: true,
      dateConsentement: new Date()
    }
  });

  console.log(`✅ Patiente créée: ${patient.prenom} ${patient.nom} (${patient.numeroPatient})`);

  // ========================================
  // ANALYSE BDF
  // ========================================
  const bdfInputs = {
    GR: 4.82,
    GB: 5.90,
    hemoglobine: 13.2,
    neutrophiles: 58,
    lymphocytes: 31,
    eosinophiles: 1.5,
    monocytes: 8,
    basophiles: 0.5,
    plaquettes: 195,
    LDH: 148,
    CPK: 52,
    TSH: 2.4,
    VS: 8,
    calcium: 2.28,
    potassium: 3.6
  };

  // Index calculés (valeurs attendues selon les formules)
  const calculatedIndexes = [
    {
      id: 'idx_genital',
      label: 'Index Génital',
      value: 0.82, // GR/GB = 4.82/5.90
      status: 'normal',
      interpretation: 'Équilibre androgènes/œstrogènes - normale haute'
    },
    {
      id: 'idx_genito_thyroidien',
      label: 'Index Génito-Thyroïdien',
      value: 1.87, // NEUT/LYMPH = 58/31
      status: 'normal',
      interpretation: 'Couplage génito-thyroïdien équilibré'
    },
    {
      id: 'idx_adaptation',
      label: 'Index d\'Adaptation',
      value: 0.19, // EOS/MONO = 1.5/8
      status: 'low',
      interpretation: '⚠️ EFFONDRÉ - Prédominance ACTH, Épuisement corticosurrénalien'
    },
    {
      id: 'idx_mobilisation_plaquettes',
      label: 'IMP - Index Mobilisation Plaquettes',
      value: 0.67, // PLQ/(60*GR) = 195/(60*4.82)
      status: 'low',
      interpretation: '⚠️ EFFONDRÉ - SPASMOPHILIE par insuffisance bêta-sympathique'
    },
    {
      id: 'idx_thyroidien',
      label: 'Index Thyroïdien',
      value: 2.85, // LDH/CPK = 148/52
      status: 'low',
      interpretation: '⚠️ TRÈS BAS - HYPOTHYROÏDIE LATENTE PÉRIPHÉRIQUE malgré TSH normale'
    },
    {
      id: 'idx_rendement_thyroidien',
      label: 'Rendement Thyroïdien',
      value: 1.19, // LDH/(TSH*CPK) = 148/(2.4*52)
      status: 'low',
      interpretation: '⚠️ BAS - Résistance périphérique aux hormones thyroïdiennes'
    },
    {
      id: 'idx_histamine_potentielle',
      label: 'Index Histamine Potentielle',
      value: 5.85, // (EOS*PLQ)/idx_cortisol estimé
      status: 'normal',
      interpretation: 'Risque histaminique modéré'
    },
    {
      id: 'idx_starter',
      label: 'Index Starter (Statut β)',
      value: 1.27, // Estimation IML/IMP
      status: 'high',
      interpretation: 'Légère dysfonction rate/foie'
    }
  ];

  const bdfAnalysis = await prisma.bdfAnalysis.create({
    data: {
      patientId: patient.id,
      inputs: bdfInputs,
      indexes: calculatedIndexes,
      axes: ['corticotrope', 'thyroidien', 'sna_beta'],
      summary: `
TRIADE ENDOBIOGÉNIQUE DÉTECTÉE:

1. HYPOTHYROÏDIE LATENTE PÉRIPHÉRIQUE
   - Index Thyroïdien (LDH/CPK) = 2.85 [Norme: 3.5-5.5]
   - TSH compensatrice à 2.4 mUI/L (faussement rassurante)
   - Résistance périphérique à la conversion T4→T3
   - Clinique: frilosité++, constipation, prise de poids, peau sèche, chute cheveux

2. ÉPUISEMENT CORTICOSURRÉNALIEN
   - Index d'Adaptation (EOS/MONO) = 0.19 [Norme: 0.25-0.50]
   - Prédominance ACTH sans réponse surrénalienne adéquate
   - Clinique: fatigue matinale++, coup de pompe 11h, tolérance stress faible, envies de salé

3. SPASMOPHILIE VRAIE (Type β-sympathique)
   - IMP (Plaquettes/60×GR) = 0.67 [Norme: 0.85-1.15]
   - Insuffisance bêta-adrénergique confirmée
   - Terrain: Ca 2.28, K 3.6 (limites basses)
   - Clinique: crampes nocturnes, paupière saute, boule gorge, hyperémotivité

TERRAIN ASSOCIÉ:
- Péri-ménopause précoce avec dérèglement génito-thyroïdien
- Syndrome métabolique débutant (glycémie 5.2, tour de taille 88cm)
- SII (colite fonctionnelle chronique depuis 10 ans)
      `.trim(),
      ragText: `
LECTURE ENDOBIOGÉNIQUE DU TERRAIN (selon la Biologie des Fonctions):

Cette patiente de 47 ans présente un tableau complexe où la TSH "normale" masque une hypothyroïdie fonctionnelle.
L'Index Thyroïdien effondré (2.85 vs norme 3.5-5.5) témoigne d'un défaut de conversion périphérique T4→T3,
probablement aggravé par le stress chronique et l'épuisement surrénalien.

Le ratio EOS/MONO effondré (0.19) signe un terrain d'hypoadaptation corticosurrénalienne. La prédominance
ACTH sans réponse cortex surrénalien adéquate explique l'asthénie profonde et les hypoglycémies réactives.

L'IMP très bas (0.67) confirme la spasmophilie par insuffisance bêta-sympathique. Le calcium et potassium
en limite basse aggravent ce terrain neuromusculaire instable.

La triade Hypothyroïdie-Hypocorticisme-Spasmophilie constitue un cercle vicieux auto-entretenu:
- L'hypothyroïdie ralentit le métabolisme surrénalien
- L'hypocorticisme aggrave la conversion thyroïdienne périphérique
- La spasmophilie témoigne de l'épuisement global du système d'adaptation

AXES THÉRAPEUTIQUES PRIORITAIRES:
1. Soutien corticosurrénalien (Cassis MG, Chêne MG)
2. Relance thyroïdienne périphérique (Fucus, cofacteurs Zn/Se)
3. Équilibrage SNA avec tropisme digestif (Figuier MG, Tilleul MG)
4. Drainage doux hépatique préalable (Pissenlit, Romarin)
5. Correction minérale (Mg, K, Ca)
      `.trim()
    }
  });

  console.log(`✅ Analyse BdF créée avec les index calculés`);

  // ========================================
  // ANTHROPOMÉTRIE
  // ========================================
  await prisma.anthropometrie.create({
    data: {
      patientId: patient.id,
      poids: 72,
      taille: 165,
      imc: 26.4,
      paSys: 115,
      paDia: 70,
      pouls: 68
    }
  });

  console.log(`✅ Anthropométrie créée (IMC: 26.4, TA: 115/70)`);

  // ========================================
  // RÉSUMÉ FINAL
  // ========================================
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 CAS CLINIQUE EXPERT CRÉÉ AVEC SUCCÈS');
  console.log('═'.repeat(60));
  console.log(`
📋 PATIENTE: ${patient.prenom} ${patient.nom}
📌 N° Patient: ${patient.numeroPatient}
🎂 Âge: 47 ans
👤 Sexe: Femme

🧪 BDF SAISIE:
   - GR: 4.82 T/L
   - GB: 5.90 G/L
   - Plaquettes: 195 G/L
   - LDH: 148 U/L
   - CPK: 52 U/L
   - TSH: 2.4 mUI/L (PIÈGE: normale!)
   - Éosinophiles: 1.5%
   - Monocytes: 8%

🔍 INDEX CLÉS CALCULÉS:
   ⚠️ Index Thyroïdien: 2.85 (Norme: 3.5-5.5) → HYPOTHYROÏDIE LATENTE
   ⚠️ Index Adaptation: 0.19 (Norme: 0.25-0.50) → ÉPUISEMENT SURRÉNALIEN
   ⚠️ IMP: 0.67 (Norme: 0.85-1.15) → SPASMOPHILIE

📝 INTERROGATOIRE: 14 axes remplis (${Object.keys(JSON.parse(patient.interrogatoire as string)).length} sections)

🎬 PRÊT POUR LA DÉMO WALKTHROUGH!
`);

  console.log('👉 Ouvrez l\'application et recherchez "BENZARTI" pour accéder au dossier\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
