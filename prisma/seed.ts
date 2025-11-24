// Fichier: prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du protocole de seeding (Inoculation)...')

  // 1. CRÉATION DU MÉDECIN (Utilisateur)
  // ------------------------------------
  const passwordHash = await bcrypt.hash('medecine', 10)
  
  const doctor = await prisma.user.upsert({
    where: { email: 'docteur@test.com' },
    update: {},
    create: {
      email: 'docteur@test.com',
      name: 'Dr. Testeur',
      password: passwordHash,
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Médecin créé : ${doctor.email} (Mdp: medecine)`)

  // 2. CRÉATION DU PATIENT "CAS CLINIQUE"
  // -------------------------------------
  // Cas : Femme 42 ans, Stress chronique, Tendance Hyperthyroïdie réactionnelle
  const patient = await prisma.patient.create({
    data: {
      userId: doctor.id,
      numeroPatient: 'PAT-DEMO-2024',
      nom: 'MARTIN',
      prenom: 'Sophie',
      dateNaissance: new Date('1982-05-15'), // 42 ans
      sexe: 'F',
      email: 'sophie.martin@email.com',
      telephone: '06 00 00 00 00',
      notes: 'Patiente adressée pour fatigue chronique et palpitations. Sommeil non réparateur.',
      allergies: 'Pénicilline',
      atcdMedicaux: 'Spasmophilie (2015), Gastrites à répétition',
      traitementActuel: 'Magnésium marin, Aubépine le soir',
      tags: ["Stress", "Thyroïde", "Sommeil"],
      // Contexte clinique pour l'IA
      symptomesActuels: ["Palpitations", "Réveils nocturnes 3h", "Anxiété", "Frilosité paradoxale"],
      pathologiesAssociees: ["Dystonie Neuro-Végétative"],
    },
  })

  console.log(`✅ Patiente créée : ${patient.nom} ${patient.prenom}`)

  // 3. INJECTION DE LA BIOLOGIE DES FONCTIONS (BdF)
  // ----------------------------------------------
  // Simulation d'un profil "Hyper-Sympathique avec effondrement Adaptatif"
  await prisma.bdfAnalysis.create({
    data: {
      patientId: patient.id,
      date: new Date(),
      // Données brutes (Inputs)
      inputs: {
        TSH: 0.45,   // Basse (Sollicitation)
        T4L: 18.5,   // Haute normale
        T3L: 4.2,    // Normale
        FSH: 6.5,
        LH: 5.2,
        Cortisol_8h: 240, // Élevé (Stress phase alarme)
        Leucocytes: 7500,
        Neutrophiles: 70, // % élevé (Sympathicotonie relative)
        Lymphocytes: 25,  // % bas
        Monocytes: 5,
        Eosinophiles: 0,  // Effondrement (Stress aigu)
      },
      // Index calculés (Simulation pour l'affichage)
      indexes: [
        { name: "Indice Catabolique", value: 4.5, status: "high", description: "Excès de dégradation tissulaire" },
        { name: "Activité Thyroïdienne Globale", value: 120, status: "high", description: "Hyper-fonctionnement réactionnel" },
        { name: "Indice d'Adaptation (Cortisol/DHEA)", value: 0.8, status: "low", description: "Ressources adaptatives faibles" },
        { name: "Indice Sympathique", value: 85, status: "high", description: "Prédominance orthosympathique (Stress)" }
      ],
      summary: "PROFIL ENDOBIOGÉNIQUE : État d'alerte neuro-endocrinien. Sollicitation excessive de l'axe thyréotrope pour compenser une demande énergétique accrue. Terrain en phase catabolique.",
      axes: ["Neuro-végétatif", "Thyréotrope", "Corticotrope"],
      ragText: "Selon la théorie (Vol 2), ce profil correspond à une 'Hyperthyroïdie fonctionnelle de contrainte'. Le système tente de maintenir l'homéostasie par une augmentation du métabolisme basal.",
    }
  })

  console.log(`✅ Analyse BdF injectée pour ${patient.nom}`)

  // 4. CRÉATION D'UNE ORDONNANCE (Brouillon)
  // ----------------------------------------
  await prisma.ordonnance.create({
    data: {
      patientId: patient.id,
      statut: "brouillon",
      syntheseClinique: "Nécessité de calmer l'axe Alpha (Sympathique) et de soutenir la loge Surrénale sans la stimuler excessivement.",
      // Volet 1 : Phyto/Gemmo
      voletEndobiogenique: [
        {
          type: "PLANTE",
          nom: "Aubépine (Crataegus oxyacantha)",
          forme: "TM",
          posologie: "50 gouttes matin et soir",
          duree: "3 mois",
          justification: "Sédatif du système nerveux sympathique, régulateur cardiaque."
        },
        {
          type: "GEMMO",
          nom: "Figuier (Ficus carica)",
          forme: "Macérat Glycériné 1D",
          posologie: "15 gouttes le soir",
          duree: "3 mois",
          justification: "Régulateur de l'axe Cortico-Hypothalamique, anxiolytique profond."
        }
      ],
      conseilsAssocies: ["Cohérence cardiaque 3x/jour", "Éviter les excitants après 14h"],
    }
  })

  console.log(`✅ Ordonnance démo créée`)
  console.log('🚀 SEEDING TERMINÉ AVEC SUCCÈS.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })