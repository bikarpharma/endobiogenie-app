// Script de seed pour créer un patient de démonstration
// Avec interrogatoire complet + BdF perturbée
// Pour tester le Learning System

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création patient de démonstration...');

  // 0. Trouver ou créer un utilisateur démo
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@endobiogenie.fr' },
    update: {},
    create: {
      email: 'demo@endobiogenie.fr',
      name: 'Praticien Démo',
      password: 'demo123', // Mot de passe non crypté juste pour démo
      role: 'USER',
    },
  });

  console.log(`✅ Utilisateur démo: ${demoUser.email} (ID: ${demoUser.id})`);

  // 1. Préparer les données d'interrogatoire (FORMAT V2)
  const interrogatoireData = {
    sexe: 'F',
    v2: {
      sexe: 'F',
      answersByAxis: {
        // AXE NEURO : Sympathicotonie marquée
        neuro: {
          neuro_sommeil_endormissement: 4, // Souvent
          neuro_sommeil_reveils: 4,        // Souvent
          neuro_transpiration: 4,          // Abondante
          neuro_frilosite: 1,              // Jamais
          neuro_palpitations: 4,           // Fréquentes
          neuro_tension_interne: 5,        // Très élevée
        },

        // AXE ADAPTATIF : Hyperadaptatif (stress chronique)
        adaptatif: {
          adapt_stress_actuel: 5,           // Très élevé
          adapt_besoin_stimulants: true,
          adapt_irritabilite: 4,            // Souvent
          adapt_epuisement: 2,              // Rarement
          adapt_fatigue_matin: 2,           // Légère
        },

        // AXE THYRO : Hypothyroïdie fonctionnelle
        thyro: {
          thyro_sensibilite_froid: true,
          thyro_peau_seche: true,
          thyro_lenteur_mentale: 4,         // Souvent
          thyro_sensibilite_chaleur: false,
          thyro_palpitations: false,
        },

        // AXE DIGESTIF : Dysbiose + Lenteur
        digestif: {
          dig_ballonnements: 5,             // Très fréquents
          dig_digestion_lente: true,
          dig_transit: 'constipation',
          dig_intolerance_alcool: true,
          dig_intolerances: 'lactose, gluten',
        },

        // AXE IMMUNO : Hyperimmunité
        immuno: {
          imm_allergies_saisonnieres: true,
          imm_douleurs_articulaires: 4,     // Fréquentes
          imm_infections_recidivantes: false,
        },
      }
    }
  };

  // 2. Créer le patient avec interrogatoire
  const patient = await prisma.patient.upsert({
    where: { numeroPatient: 'DEMO-001' },
    update: {
      interrogatoire: interrogatoireData,
    },
    create: {
      userId: demoUser.id,
      numeroPatient: 'DEMO-001',
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: new Date('1985-06-15'),
      sexe: 'F',
      email: 'sophie.martin@demo.fr',
      telephone: '0612345678',
      interrogatoire: interrogatoireData,
    },
  });

  console.log(`✅ Patient créé: ${patient.prenom} ${patient.nom} (ID: ${patient.id})`);
  console.log(`✅ Interrogatoire enregistré avec perturbations multiples`);

  // 3. Créer une analyse BdF perturbée
  const bdfAnalysis = await prisma.bdfAnalysis.create({
    data: {
      patientId: patient.id,

      // Valeurs d'entrée (inputs)
      inputs: {
        TSH: 3.5,
        T4L: 11.0,
        FSH: 6.0,
        LH: 4.0,
        E2: 80.0,
        PRL: 15.0,
        Testo: 0.4,
        DHEA: 5.0,
        Cortisol_8h: 250.0,
        Cortisol_16h: 120.0,
        GH: 2.0,
        IGF1: 180.0,
        Glycemie: 5.2,
        Cholesterol: 2.1,
        ALAT: 25.0,
        ASAT: 22.0,
        PAL: 65.0,
      },

      // Index calculés PERTURBÉS
      indexes: {
        indexGenital: 520.0,        // < 550 = empreinte œstrogénique (hypo)
        indexThyroidien: 1.8,        // < 2.0 = hypométabolisme HYPO
        gT: 2.5,
        indexAdaptation: 0.3,        // < 0.4 = hyperadaptatif STRESS
        indexOestrogenique: 0.09,    // > 0.08 = forte pro-croissance
        turnover: 165.0,             // > 150 = sur-sollicitation
        rendementThyroidien: 0.7,    // < 0.8 = réponse lente
        remodelageOsseux: 4.5,
      },

      // Résumé fonctionnel (requis par schema)
      summary: "Terrain hypothyroïdien avec hyperadaptativité corticotrope. Empreinte œstrogénique marquée avec turn-over tissulaire élevé indiquant une sur-sollicitation adaptative.",

      // Axes perturbés (requis par schema)
      axes: ["thyroidien", "corticotrope", "somatotrope", "genital"],

      // Lecture endobiogénique enrichie par RAG (optionnel)
      ragText: "Terrain hypothyroïdien avec hyperadaptativité corticotrope. Empreinte œstrogénique marquée avec turn-over tissulaire élevé indiquant une sur-sollicitation adaptative.",
    },
  });

  console.log(`✅ BdF créée avec index perturbés:`);
  console.log(`   - Index Thyroïdien: 1.8 (hypométabolisme)`);
  console.log(`   - Index Adaptation: 0.3 (hyperadaptatif stress)`);
  console.log(`   - Index Génital: 520 (empreinte œstrogénique)`);
  console.log(`   - Turn-over: 165 (sur-sollicitation)`);

  console.log('\n✨ Patient de démonstration créé avec succès!');
  console.log(`📋 Numéro: ${patient.numeroPatient}`);
  console.log(`👤 Nom: ${patient.prenom} ${patient.nom}`);
  console.log(`\n🎯 Ce patient présente:`);
  console.log(`   - Interrogatoire: Stress, hypothyroïdie, dysbiose`);
  console.log(`   - BdF: 4 axes perturbés majeurs`);
  console.log(`\n🧪 Parfait pour tester le Learning System avec tooltips!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
