// Script pour ajouter un patient de test
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Récupérer le premier utilisateur (ou vous pouvez remplacer par votre ID)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('❌ Aucun utilisateur trouvé. Créez un compte d\'abord.');
    return;
  }

  console.log(`✅ Utilisateur trouvé: ${user.email}`);

  // Créer un patient de test avec données complètes
  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      numeroPatient: 'TEST-001',
      nom: 'Dupont',
      prenom: 'Marie',
      dateNaissance: new Date('1985-06-15'),
      sexe: 'F',
      telephone: '0612345678',
      email: 'marie.dupont@example.com',
      allergies: 'Pénicilline, Arachides',
      atcdMedicaux: 'Hypertension artérielle depuis 2018',
      atcdChirurgicaux: 'Appendicectomie en 2010',
      traitements: 'Lisinopril 10mg/jour',
      consentementRGPD: true,
      dateConsentement: new Date(),
      notes: 'Patiente suivie pour hypertension et fatigue chronique.',

      // Ajouter une analyse BdF
      bdfAnalyses: {
        create: {
          date: new Date('2025-10-15'),
          inputs: {
            GR: 4.5,
            GB: 7.2,
            HB: 13.5,
            HT: 42,
            VGM: 88,
            TCMH: 29,
            CCMH: 33,
            PLQ: 250,
            FERRITINE: 45,
            VITB12: 350,
            VITD: 28,
            TSH: 2.1
          },
          indexes: [
            {
              name: "Index Alpha",
              value: 2.8,
              comment: "Normotrophie"
            },
            {
              name: "Index Bêta",
              value: 1.5,
              comment: "Équilibre sympathique"
            },
            {
              name: "Index Gamma",
              value: 3.2,
              comment: "Bon fonctionnement parasympathique"
            },
            {
              name: "Index Delta",
              value: 0.85,
              comment: "Équilibre neuro-hormonal"
            },
            {
              name: "Rapport A/G",
              value: 0.875,
              comment: "Terrain équilibré"
            },
            {
              name: "Index Cortico-Thyroïdien",
              value: 1.2,
              comment: "Normothyroïdie"
            },
            {
              name: "Index Génito-Thyroïdien",
              value: 1.8,
              comment: "Bon équilibre hormonal"
            },
            {
              name: "Index Global",
              value: 92,
              comment: "Vitalité globale satisfaisante"
            }
          ],
          summary: "Terrain globalement équilibré avec légère tendance à la carence en vitamine D. Les index de la Biologie des Fonctions sont dans les normes. Surveillance de la ferritine recommandée (limite basse).",
          axes: ["Axe Thyroïdien", "Axe Métabolique"],
          ragText: "Le terrain présente une normotrophie alpha avec un équilibre sympatho-vagal satisfaisant. La légère carence en vitamine D suggère une attention particulière à l'exposition solaire et à la supplémentation. La ferritine en limite basse nécessite une surveillance sans intervention immédiate."
        }
      },

      // Ajouter une consultation
      consultations: {
        create: {
          dateConsultation: new Date('2025-10-20'),
          type: 'suivi',
          motifConsultation: 'Suivi de contrôle - Fatigue persistante suite à analyse BdF',
          commentaire: 'Patiente rapporte une amélioration de l\'énergie depuis la dernière visite. Légère carence en vitamine D confirmée par les résultats biologiques. Ferritine en limite basse à surveiller.',
          prescriptions: '- Vitamine D3 2000 UI/jour pendant 3 mois\n- Contrôle ferritine dans 3 mois\n- Exposition solaire quotidienne 15-20min si possible',
        }
      },

      // Ajouter une anthropométrie
      anthropometries: {
        create: {
          date: new Date('2025-10-20'),
          poids: 65.5,
          taille: 168,
          imc: 23.2,
          paSys: 125,
          paDia: 78,
          pouls: 72,
        }
      }
    },
    include: {
      bdfAnalyses: true,
      consultations: true,
      anthropometries: true,
    }
  });

  console.log('\n🎉 Patient de test créé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 ID: ${patient.id}`);
  console.log(`👤 Nom: ${patient.prenom} ${patient.nom}`);
  console.log(`🔢 Numéro: ${patient.numeroPatient}`);
  console.log(`📊 Analyses BdF: ${patient.bdfAnalyses.length}`);
  console.log(`📋 Consultations: ${patient.consultations.length}`);
  console.log(`📏 Anthropométries: ${patient.anthropometries.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🌐 Testez maintenant: http://localhost:3000/patients/${patient.id}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
