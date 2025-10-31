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
          nom: 'Analyse BdF complète',
          resultats: JSON.stringify({
            hemoglobine: 13.5,
            ferritine: 45,
            vitB12: 350,
            vitD: 28
          }),
          interpretations: 'Légère carence en vitamine D. Ferritine dans la norme basse.',
          recommandations: 'Supplémentation en vitamine D 2000 UI/jour',
        }
      },

      // Ajouter une consultation
      consultations: {
        create: {
          dateConsultation: new Date('2025-10-20'),
          motif: 'Suivi de contrôle - Fatigue persistante',
          diagnostic: 'Carence en vitamine D confirmée',
          traitement: 'Vitamine D3 2000 UI/jour pendant 3 mois',
          notes: 'Patiente rapporte une amélioration de l\'énergie depuis la dernière visite.',
          dureeMinutes: 30,
        }
      },

      // Ajouter une anthropométrie
      anthropometries: {
        create: {
          date: new Date('2025-10-20'),
          poids: 65.5,
          taille: 168,
          imc: 23.2,
          tourTaille: 78,
          tourHanches: 95,
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
